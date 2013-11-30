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

VIDEO_FORMATS = set(["image/gif", "video/ogg", "video/mp4"])
AUDIO_FORMATS = set(["audio/mpeg", "audio/ogg"])
FORMATS = set(["image/png", "image/jpeg", "image/svg+xml"]) | VIDEO_FORMATS | AUDIO_FORMATS
LOOP_FORMATS = set(["image/gif"])
AUTOPLAY_FORMATS = set(["image/gif"])

EXTENSIONS = {
    # "application/pdf": "pdf",
    "audio/mpeg": "mp3",
    "audio/ogg": "oga",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    # "text/plain": "txt",
    "video/mp4": "mp4",
    "video/ogg": "ogv",
    "video/webm": "webm",
}

processing_needed = {
    'image/gif': {
        'formats': ['video/mp4', 'video/ogg', 'video/webm'],
        'extras': ['image/png'],
        'time': 300,
    },
    'video/mp4': {
        'formats': ['video/webm', 'video/ogg'],
        'extras': ['image/png'],
        'time': 600,
    },
    'video/webm': {
        'formats': ['video/mp4', 'video/ogv'],
        'extras': ['image/png'],
        'time': 600,
    },
    'video/ogg': {
        'formats': ['video/mp4', 'video/webm'],
        'extras': ['image/png'],
        'time': 600,
    },
    'image/jpeg': {
        'formats': [],
        'time': 5
    },
    'image/png': {
        'formats': [],
        'time': 60
    },
    'image/svg+xml': {
        'formats': [],
        'time': 5
    },
    'audio/mp3': {
        'formats': ['audio/ogg'],
        'time': 120
    },
    'audio/ogg': {
        'formats': ['audio/oga','audio/mp3'],
        'time': 120
    },
}

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

def allowed_format(mimetype):
    return mimetype in EXTENSIONS

def clean_extension(path, mimetype):
    return "%s.%s" % (os.path.splitext(path)[0], EXTENSIONS[mimetype])

def get_hash(f):
    f.seek(0)
    return hashlib.md5(f.read()).digest()

def get_mimetype(url):
    ext = extension(url)
    for k, v in EXTENSIONS.items():
        if v == ext:
            return k

def media_url(f):
    return '/%s' % f

def file_storage(f):
    return os.path.join(_cfg("storage_folder"), f)

def file_length(f):
    f.seek(0, 2)
    by = f.tell()
    f.seek(0)

    return by

def compression_rate(f):
    f_original = File.from_hash(f)
    ext = extension(f_original.original)
    if ext not in processing_needed: return 0
    if len(processing_needed[ext]['formats']) == 0: return 0

    original_size = f_original.compression
    minsize = min(original_size, os.path.getsize(file_storage(f_original.original)))
    for f_ext in processing_needed[ext]['formats']:
        try:
            convsize = os.path.getsize(file_storage("%s.%s" % (f, f_ext)))
            minsize = min(minsize, convsize)
        except OSError:
            continue # One of the target files wasn't processed.
                     # This will fail later in the processing workflow.

    # Cross-multiplication:
    # Original size   1
    # ------------- = -
    # Min size        x

    x = minsize / float(original_size)

    # Compression rate: 1/x
    return round(1/x, 2)

def upload(f, filename):
    if not f.content_type:
        f.content_type = get_mimetype(filename) or "application/octet-stream"

    if not allowed_format(f.content_type):
        return "no", 415

    filename = clean_extension(filename, f.content_type)

    if not current_app.debug:
        rate_limit_update(file_length(f))
        if rate_limit_exceeded():
            return "ratelimit", 420

    h = get_hash(f)
    identifier = to_id(h)
    filename = "%s.%s" % (identifier, extension(filename))
    path = file_storage(filename)

    if os.path.exists(path):
        if File.exists(identifier):
            return identifier, 409
        else:
            # Delete residual files from storage by creating a dummy File
            dummy = File(original=filename)
            dummy.delete = lambda: None # nop
            delete_file(dummy)

            r.delete(_k("%s.lock") % identifier) # Remove processing lock and error
            r.delete(_k("%s.error") % identifier)

    f.seek(0)  # Otherwise it'll write a 0-byte file
    f.save(path)

    file_object = File(hash=identifier)
    file_object.compression = os.path.getsize(path)
    file_object.original = filename
    file_object.ip = secure_ip()
    file_object.save()

    r.lpush(_k("gifqueue"), identifier)  # Add this job to the queue
    r.set(_k("%s.lock" % identifier), "1")  # Add a processing lock

    return identifier

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

def delete_file_storage(path):
    try:
        os.unlink(file_storage(path))
    except:
        print('Failed to delete file ' + path)

extension = lambda f: f.rsplit('.', 1)[1].lower()
to_id = lambda h: base64.b64encode(h)[:12].replace('/', '_').replace('+', '-')
