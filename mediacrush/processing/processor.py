from mediacrush.config import _cfg

import os

class ProcessingException(Exception): pass
class TimeoutException(Exception): pass

class Processor(object):
    def __init__(self, tmppath, f):
        self.path = tmppath
        self.output = os.path.join(_cfg("storage_folder"), f.hash)

        self.f = f

    def _execute(self, command, important=True):
        tlc = command(self.path, self.output)
        tlc.run()

        if tlc.exited and important:
            raise TimeoutException

        if tlc.returncode != 0 and important:
            raise ProcessingException
