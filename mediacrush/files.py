import mimetypes
import base64
import hashlib
import os
import tempfile
import requests

from flask import current_app

from .config import _cfg
from .database import r, _k
from .objects import File
from .ratelimit import rate_limit_exceeded, rate_limit_update
from .network import secure_ip

VIDEO_EXTENSIONS = set(['gif', 'ogv', 'mp4'])
AUDIO_EXTENSIONS = set(['mp3', 'ogg', 'oga'])
EXTENSIONS = set(['png', 'jpg', 'jpe', 'jpeg', 'svg']) | VIDEO_EXTENSIONS | AUDIO_EXTENSIONS
LOOP_EXTENSIONS = set(['gif'])
AUTOPLAY_EXTENSIONS = set(['gif'])

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
        for chunk in r.iter_content(chunk_size=1024):
            self.f.write(chunk)
            self.f.flush()

        if r.status_code == 404:
            return False

        if "content-type" in r.headers:
            self.content_type = r.headers['content-type']
        self.filename = list(reversed(url.split("/")))[0]

        return True

processing_needed = {
    'gif': {
        'formats': ['mp4', 'ogv'],
        'time': 120,
    },
    'mp4': {
        'formats': ['ogv'],
        'time': 300,
    },
    'ogv': {
        'formats': ['mp4'],
        'time': 300,
    },
    'jpg': {
        'formats': [],
        'time': 5
    },
    'jpe': {
        'formats': [],
        'time': 5
    },
    'jpeg': {
        'formats': [],
        'time': 5
    },
    'png': {
        'formats': [],
        'time': 30
    },
    'svg': {
        'formats': [],
        'time': 5
    },
    'mp3': {
        'formats': ['ogg'],
        'time': 120
    },
    'ogg': {
        'formats': ['oga','mp3'],
        'time': 120
    },
    'oga': {
        'formats': ['mp3'],
        'time': 120
    }
}

def allowed_file(filename):
    return '.' in filename and extension(filename) in EXTENSIONS

def get_hash(f):
    f.seek(0)
    return hashlib.md5(f.read()).digest()

def get_mimetype(url):
    return mimetypes.guess_type(url)[0]

def media_url(f):
    return '/%s' % f

def file_storage(f):
    return os.path.join(_cfg("storage_folder"), f)

def compression_rate(f):
    f_original = File.from_hash(f)
    ext = extension(f_original.original)
    if ext not in processing_needed: return 0
    if len(processing_needed[ext]['formats']) == 0: return 0

    original_size = os.path.getsize(file_storage(f_original.original))
    minsize = original_size
    for f_ext in processing_needed[ext]['formats']:
        convsize = os.path.getsize(file_storage("%s.%s" % (f, f_ext)))
        minsize = min(minsize, convsize)

    # Cross-multiplication:
    # Original size   1
    # ------------- = -
    # Min size        x

    x = minsize / float(original_size)

    # Compression rate: 1/x
    return round(1/x, 2)

def upload(f, filename):
    if f.content_type and f.content_type != "application/octet-stream":
        # Add the proper file extension if the mimetype is provided
        ext = mimetypes.guess_extension(f.content_type)
        if not ext:
            # Specified mimetype is not in /etc/mime.types.
            # At this point, our best guess is to assume the extension
            # is the last part of the mimetype.
            ext = "." + f.content_type.split("/")[1]

        filename += ext

    if f and allowed_file(filename):
        if not current_app.debug:
            rate_limit_update(f)
            if rate_limit_exceeded():
                return "ratelimit", 420

        h = get_hash(f)
        identifier = to_id(h)
        filename = "%s.%s" % (identifier, extension(filename))
        path = os.path.join(_cfg("storage_folder"), filename)

        if os.path.exists(path):
            return identifier, 409

        f.seek(0)  # Otherwise it'll write a 0-byte file
        f.save(path)

        file_object = File(hash=identifier)
        file_object.original = filename
        file_object.ip = secure_ip()
        file_object.save()

        r.lpush(_k("gifqueue"), identifier)  # Add this job to the queue
        r.set(_k("%s.lock" % identifier), "1")  # Add a processing lock

        return identifier
    else:
        return "no", 415

def delete_file(f):
    ext = extension(f.original)
    delete_file_storage(f.original)

    if ext in processing_needed:
        for f_ext in processing_needed[ext]['formats']:
            delete_file_storage("%s.%s" % (f.hash, f_ext))

    f.delete()

def processing_status(id):
    filename = id
    if not r.exists(_k("%s.lock" % filename)):
        if r.exists(_k("%s.error" % filename)):
            failure_type = r.get(_k("%s.error" % filename))
            r.delete(_k("%s.error") % filename)

            return failure_type

        return "done"
    return "processing"

delete_file_storage = lambda f: os.unlink(file_storage(f)) # Abstraction: we may need it if we switch to a non-fs-based storage in the future.
extension = lambda f: f.rsplit('.', 1)[1].lower()
to_id = lambda h: base64.b64encode(h)[:12].replace('/', '_').replace('+', '-')
