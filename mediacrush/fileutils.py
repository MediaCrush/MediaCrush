from mediacrush.objects import File
from mediacrush.config import _cfg

import os

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
    },
    'video/mp4': {
        'formats': ['video/webm', 'video/ogg'],
        'extras': ['image/png'],
    },
    'video/webm': {
        'formats': ['video/mp4', 'video/ogv'],
        'extras': ['image/png'],
    },
    'video/ogg': {
        'formats': ['video/mp4', 'video/webm'],
        'extras': ['image/png'],
    },
    'image/jpeg': {
        'formats': [],
    },
    'image/png': {
        'formats': [],
    },
    'image/svg+xml': {
        'formats': [],
    },
    'audio/mp3': {
        'formats': ['audio/ogg'],
    },
    'audio/ogg': {
        'formats': ['audio/oga','audio/mp3'],
    },
}

extension = lambda f: f.rsplit('.', 1)[1].lower()

def get_mimetype(url):
    ext = extension(url)
    for k, v in EXTENSIONS.items():
        if v == ext:
            return k

def file_storage(f):
    return os.path.join(_cfg("storage_folder"), f)

def compression_rate(f):
    f_original = File.from_hash(f)
    mimetype = get_mimetype(f_original.original)
    if mimetype not in processing_needed: return 0
    if len(processing_needed[mimetype]['formats']) == 0: return 0

    original_size = os.path.getsize(file_storage(f_original.original))
    minsize = min(original_size, os.path.getsize(file_storage(f_original.original)))
    for f_type in processing_needed[mimetype]['formats']:
        try:
            convsize = os.path.getsize(file_storage("%s.%s" % (f, EXTENSIONS[f_type])))
            print("%s: %s (%s)" % (f_type, convsize, original_size))
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
