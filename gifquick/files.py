import mimetypes
import base64
import hashlib
import os

from .config import _cfg
from .database import r, _k

CONTROLS_EXTENSIONS = set(['ogv', 'mp4'])
VIDEO_EXTENSIONS = set(['gif']) | CONTROLS_EXTENSIONS
EXTENSIONS = set(['png', 'jpg', 'jpeg']) | VIDEO_EXTENSIONS


conversions_needed = {
    'gif': {
        'formats': ['mp4', 'ogv'],
        'time': 60,
    },
    'mp4': {
        'formats': ['ogv'],
        'time': 300,
    },
    'ogv': {
        'formats': ['mp4'],
        'time': 300,
    },
}

def allowed_file(filename):
    return '.' in filename and extension(filename) in EXTENSIONS

def get_hash(f):
    return hashlib.md5(f.read()).digest()

def get_mimetype(url):
    return mimetypes.guess_type(url)[0]

def media_url(f):
    return '/%s' % f

def file_storage(f):
    return os.path.join(_cfg("storage_folder"), f)

def compression_rate(f):
    original = r.get(_k("%s.file") % f)
    ext = extension(original)
    if ext not in conversions_needed: return 0

    original_size = os.path.getsize(file_storage(original))
    minsize = original_size
    for f_ext in conversions_needed[ext]['formats']:
        convsize = os.path.getsize(file_storage("%s.%s" % (f, f_ext)))
        minsize = min(minsize, convsize)

    # Cross-multiplication:
    # Original size   1
    # ------------- = -
    # Min size        x

    x = minsize / float(original_size)

    # Compression rate: 1/x
    return round(1/x, 2)

extension = lambda f: f.rsplit('.', 1)[1].lower()
to_id = lambda h: base64.b64encode(h)[:12].replace('/', '_').replace('+', '-')
