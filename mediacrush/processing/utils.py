from mediacrush.config import _cfgi

import os
import threading
import subprocess

class TimeLimitedCommand(object):
    crashed = False

    def __init__(self, *args):
        self.args = args
        self.process = None

    def _target(self):
        with open(os.devnull, "w") as devnull:
            try:
                self.process = subprocess.Popen(
                    *self.args, stdout=devnull, stderr=devnull)
                self.process.communicate()
            except:
                self.crashed = True
                return

    def run(self, timeout=_cfgi("max_processing_time")):
        exited = False

        thread = threading.Thread(target=self._target)
        thread.start()
        thread.join(timeout)

        if thread.is_alive():
            print("Terminating process")
            self.process.terminate()
            thread.join()
            exited = True

        if self.process == None:
            return 0 if not self.crashed else 1, exited
        return self.process.returncode, exited

class Invocation(object):
    def __init__(self, command):
        self.command = command

    def __call__(self, *args):
        args = self.command.format(*args).split()
        return TimeLimitedCommand(args)
