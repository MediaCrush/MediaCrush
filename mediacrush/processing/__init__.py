from mediacrush.config import _cfg
from mediacrush.processing.commands import *

import os

class ProcessingException(Exception): pass
class TimeoutException(Exception): pass

class Processor(object):
    def _path(self, basename):
        return

    def __init__(self, f):
        self.path = os.path.join(_cfg("storage_folder"), f.original)
        self.output = os.path.join(_cfg("storage_folder"), f.hash)

        self.f = f

    def execute(self):
        commands = self.sync()

        for command in commands:
            code, exited = command(self.path, self.output).run()
            if code != 0:
                raise ProcessingException

            if exited:
                raise TimeoutException


class GIFProcessor(Processor):
    def sync(self):
        return [mp4]

    def async(self):
        return [webm]

processor_table = {
    'image/gif': GIFProcessor,
}
