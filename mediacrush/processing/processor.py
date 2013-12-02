from mediacrush.config import _cfg

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

    def _execute(self, commands, important=True):
        print commands
        for command in commands:
            code, exited = command(self.path, self.output).run()

            if exited and important:
                raise TimeoutException

            if code != 0 and important:
                raise ProcessingException

    def run(self, sync=True):
        if not sync and "async" not in dir(self): # If there's no 'async' field, return.
            return

        commands = self.sync if sync else self.async

        self._execute(commands, important=sync) # The asynchronous step is the "non-important" one.

