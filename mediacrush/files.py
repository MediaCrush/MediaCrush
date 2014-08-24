import mimetypes
import base64
import hashlib
import os
import tempfile
import re

from flask import current_app

from mediacrush.config import _cfg
from mediacrush.database import r, _k
from mediacrush.objects import File
from mediacrush.ratelimit import rate_limit_exceeded, rate_limit_update
from mediacrush.network import secure_ip, get_ip
from mediacrush.tasks import process_file
from mediacrush.fileutils import EXTENSIONS, get_mimetype, file_storage, extension, delete_file
from mediacrush.celery import app

def get_hash(f):
    f.seek(0)
    return hashlib.md5(f.read()).digest()

def media_url(f, absolute=True):
    cdn = _cfg("cdn")
    domain = _cfg("domain")
    base = _cfg("protocol") + "://" + domain if len(cdn) == 0 else cdn

    return '%s/%s' % (base, f) if absolute else '/%s' % f

def file_length(f):
    f.seek(0, 2)
    by = f.tell()
    f.seek(0)

    return by

def upload(f, filename, ip=None, h=None):
    if not f.content_type:
        f.content_type = get_mimetype(filename) or "application/octet-stream"

    #if f.content_type.split("/")[0] not in ['video', 'image', 'audio']:
    #    return "no", 415

    ignore_limit = current_app.debug or r.sismember(_k("whitelisted_ips"), get_ip())
    if not ignore_limit:
        rate_limit_update(file_length(f))
        if rate_limit_exceeded():
            return None, 420

    if not h:
        h = get_hash(f)

    identifier = to_id(h)
    if "." not in filename:
        ext = mimetypes.guess_extension(f.content_type)[1:] # This not very scientific, but it works
    else:
        ext = extension(filename)

    filename = "%s.%s" % (identifier, ext)
    path = tempfile.NamedTemporaryFile(suffix="." + ext).name # Fix for imagemagick's silliness

    if os.path.exists(file_storage(filename)):
        if File.exists(identifier):
            return identifier, 409
        else:
            # Delete residual files from storage by creating a dummy File
            dummy = File(original=filename)
            dummy.delete = lambda: None # nop
            delete_file(dummy)

    f.seek(0)  # Otherwise it'll write a 0-byte file
    f.save(path)

    if not ip:
        ip = secure_ip()

    file_object = File(hash=identifier)
    file_object.compression = os.path.getsize(path)
    file_object.original = filename
    file_object.mimetype = f.content_type
    file_object.ip = ip

    result = process_file.delay(path, identifier, ignore_limit)
    file_object.taskid = result.id

    file_object.save()

    return identifier, 200


to_id = lambda h: base64.b64encode(h)[:12].replace('/', '_').replace('+', '-')
