import mimetypes
import base64
import hashlib
import os
import tempfile
import requests
import re

from flask import current_app
from urlparse import urlparse

from mediacrush.config import _cfg
from mediacrush.paths import file_storage, shard
from mediacrush.database import r, _k
from mediacrush.objects import File
from mediacrush.ratelimit import rate_limit_exceeded, rate_limit_update
from mediacrush.network import secure_ip, get_ip
from mediacrush.tasks import process_file
from mediacrush.fileutils import EXTENSIONS, get_mimetype, extension, delete_file
from mediacrush.celery import app

class FileTooBig(Exception):
    pass


class URLFile(object):
    filename = None
    content_type = None
    override_methods = ["save"]

    def __init__(self, *args, **kwargs):
        self.f = tempfile.TemporaryFile()

    def __getattr__(self, name):
        target = self.f if name not in self.override_methods else self
        return getattr(target, name)

    def save(self, path):
        bufsize = 1024 * 1024
        with open(path, "w") as f:
            while True:
                cpbuffer = self.f.read(bufsize)
                if cpbuffer:
                    f.write(cpbuffer)
                else:
                    break

            f.flush()
            f.close()

    def download(self, url):
        r = requests.get(url, stream=True)
        length = r.headers["content-length"]
        if not length.isdigit() or int(length) > get_maxsize():
            raise FileTooBig("The file was larger than "+_cfg("max_file_size"))

        for i, chunk in enumerate(r.iter_content(chunk_size=1024)):
            if i > get_maxsize() / 1024:
                # Evil servers may send more than Content-Length bytes
                # As of 54541a9, python-requests keeps reading indefinitely
                raise FileTooBig("The file was larger than "+_cfg("max_file_size"))
            self.f.write(chunk)
            self.f.flush()

        if r.status_code == 404:
            return False

        parsed_url = urlparse(url)
        self.filename = list(reversed(parsed_url.path.split("/")))[0]

        if "content-type" in r.headers:
            self.content_type = r.headers['content-type']
            ext = mimetypes.guess_extension(self.content_type)
            if ext:
                self.filename = self.filename + ext

        if "content-disposition" in r.headers:
            disposition = r.headers['content-disposition']
            parts = disposition.split(';')
            if len(parts) > 1:
                self.filename = parts[1].strip(' ')
                self.filename = self.filename[self.filename.find('=') + 1:].strip(' ')

        self.filename = ''.join([c for c in self.filename if c.isalpha() or c == '.'])

        return True

def get_hash(f):
    f.seek(0)
    return hashlib.md5(f.read()).digest()

def media_url(f, absolute=True):
    f = shard(f)
    cdn = _cfg("cdn")
    domain = _cfg("domain")
    base = _cfg("protocol") + "://" + domain if len(cdn) == 0 else cdn

    return '%s/%s' % (base, f) if absolute else '/%s' % f

def file_length(f):
    f.seek(0, 2)
    by = f.tell()
    f.seek(0)

    return by

def get_maxsize():
    size = _cfg("max_file_size")
    symbols = ('B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y')
    letter = size[-1:].strip().upper()
    num = size[:-1]
    assert num.isdigit() and letter in symbols
    num = float(num)
    prefix = {symbols[0]:1}
    for i, size in enumerate(symbols[1:]):
        prefix[size] = 1 << (i+1)*10
    return int(num * prefix[letter])

def upload(f, filename):
    if not f.content_type:
        f.content_type = get_mimetype(filename) or "application/octet-stream"

    #if f.content_type.split("/")[0] not in ['video', 'image', 'audio']:
    #    return "no", 415

    ignore_limit = current_app.debug or r.sismember(_k("whitelisted_ips"), get_ip())
    if not ignore_limit:
        rate_limit_update(file_length(f))
        if rate_limit_exceeded():
            return None, 420

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

    file_object = File(hash=identifier)
    file_object.compression = os.path.getsize(path)
    file_object.original = filename
    file_object.mimetype = f.content_type
    file_object.ip = secure_ip()

    result = process_file.delay(path, identifier, ignore_limit)
    file_object.taskid = result.id

    file_object.save()

    return identifier, 200


to_id = lambda h: base64.b64encode(h)[:12].replace('/', '_').replace('+', '-')
