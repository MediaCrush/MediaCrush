from mediacrush.config import _cfg
from mediacrush.processing.invocation import Invocation
from mediacrush.mimeinfo import extension

import os

class ProcessingException(Exception): pass
class TimeoutException(Exception): pass

class Processor(object):
    outputs = []
    extras = []

    def __init__(self, tmppath, f, extra):
        self.path = tmppath
        self.output = os.path.join(_cfg("storage_folder"), f.hash)
        self.extra = extra

        self.important = True

        self.f = f

    def _execute(self, command):
        ext = extension(self.f.original)

        tlc = Invocation(command)(self.path, self.output, extension=ext)
        tlc.run(self.time)

        if tlc.exited and self.important:
            raise TimeoutException

        if tlc.returncode != 0 and self.important:
            raise ProcessingException

    def sync(self):
        pass

    def async(self):
        pass
