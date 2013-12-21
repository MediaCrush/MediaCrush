from mediacrush.config import _cfg
from mediacrush.mimeinfo import EXTENSIONS, get_mimetype, extension
from mediacrush.processing import get_processor

import os

class BitVector(object):
    shifts = {}
    _vec = 0

    def __init__(self, names, iv=0):
        for i, name in enumerate(names):
            self.shifts[name] = i

        self._vec = iv

    def __getattr__(self, name):
        if name not in self.shifts:
            raise AttributeError(name)

        value = self._vec & (1 << self.shifts[name])
        return True if value != 0 else False

    def __setattr__(self, name, v):
        if name == '_vec':
            object.__setattr__(self, '_vec', v)
            return

        if name not in self.shifts:
            raise AttributeError(name)

        newvec = self._vec

        currentval = getattr(self, name)
        if currentval == v:
            return # No change needed

        if currentval == True:
            # Turn this bit off
            newvec &= ~(1 << self.shifts[name])
        else:
            # Turn it on
            newvec |= (1 << self.shifts[name])

        object.__setattr__(self, '_vec', newvec)

    def __int__(self):
        return self._vec

flags_per_processor = {
    'video': ['autoplay', 'loop', 'mute']
}

def normalise_processor(processor):
    if not processor: return None
    return processor.split("/")[0] if "/" in processor else processor

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
        extensions = processor.outputs
        if 'extras' in dir(processor):
            extensions += processor.extras

        for f_ext in extensions:
            delete_file_storage("%s.%s" % (f.hash, f_ext))

    f.delete()

def delete_file_storage(path):
    try:
        os.unlink(file_storage(path))
    except:
        pass # It's fine if one or more files are missing - it means that the processing pipeline might not have got to them.
