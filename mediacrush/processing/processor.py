from mediacrush.config import _cfg
from mediacrush.paths import file_storage
from mediacrush.processing.invocation import Invocation
from mediacrush.mimeinfo import extension

import os

class ProcessingException(Exception): pass
class TimeoutException(Exception): pass
class UnrecognisedFormatException(Exception): pass

class Processor(object):
    outputs = []
    extras = []

    def __init__(self, tmppath, f, processor_state, ignore_limit):
        self.path = tmppath
        self.output = file_storage(f.hash)
        self.processor_state = processor_state
        self.ignore_limit = ignore_limit

        self.important = True

        self.f = f

    def _execute(self, command, ignoreNonZero = False):
        ext = extension(self.f.original)

        tlc = Invocation(command)(self.path, self.output, extension=ext)
        tlc.run(self.time if not self.ignore_limit else None)

        if tlc.exited and self.important:
            raise TimeoutException

        if tlc.returncode != 0 and self.important and not ignoreNonZero:
            raise ProcessingException

    def sync(self):
        pass

    def async(self):
        pass
