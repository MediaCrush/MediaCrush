from mediacrush.objects import File, RedisObject
from mediacrush.database import r, _k
from mediacrush.fileutils import file_storage

from mediacrush.processing.invocation import Invocation
from mediacrush.config import _cfg, _cfgi
import sys
import json

if __name__ == '__main__':
    files = File.get_all()
    count = len(files)

    print("About to process %d files." % count)

    done = 0
    errors = []

    for f in files:
        h = f.hash

        k = _k("file.%s" % h)
        r.hset(k, "ip", "")

    print("\n%d/%d files processed, errors:" % (done, count), errors)

def normalise_processor(processor):
    if not processor: return None
    return processor.split("/")[0] if "/" in processor else processor
