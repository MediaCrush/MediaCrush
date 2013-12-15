from mediacrush.objects import File
from mediacrush.config import _cfg
from mediacrush.mimetypes import EXTENSIONS, get_mimetype, extension
from mediacrush.processing import get_processor

import os

def file_storage(f):
    return os.path.join(_cfg("storage_folder"), f)

def compression_rate(originalpath, f):
    if f.processor == 'default': return 0
    processor = get_processor(f.processor)

    original_size = os.path.getsize(originalpath)
    minsize = min(original_size, original_size)
    for ext in processor.outputs:
        try:
            convsize = os.path.getsize(file_storage("%s.%s" % (f.hash, ext)))
            print("%s: %s (%s)" % (ext, convsize, original_size))
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

def delete_file(f):
    delete_file_storage(f.original)
    processor = get_processor(f.processor)

    if processor != 'default':
        for f_ext in processor.outputs:
            delete_file_storage("%s.%s" % (f.hash, f_ext))

    f.delete()

def delete_file_storage(path):
    try:
        os.unlink(file_storage(path))
    except:
        pass # It's fine if one or more files are missing - it means that the processing pipeline might not have got to them.
