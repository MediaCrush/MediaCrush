from mediacrush.config import _cfgi, _cfg

import os
import threading
import subprocess
import time

class Invocation(object):
    crashed = False
    exited = False
    stdout = None
    stderr = None
    process = None
    args = []

    def __init__(self, command):
        self.command = command

    def __call__(self, *args, **kw):
        self.args = self.command.format(*args, **kw).split()
        return self

    def _target(self):
        try:
            self.process = subprocess.Popen(self.args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            self.stdout, self.stderr = self.process.communicate()
        except:
            self.crashed = True
            return

    def run(self, timeout=_cfgi("max_processing_time")):
        if not self.args:
            self.args = self.command.split()

        thread = threading.Thread(target=self._target)
        thread.start()
        thread.join(timeout)

        if thread.is_alive():
            print("Terminating process")
            self.process.terminate()
            thread.join()
            self.exited = True

        self.returncode = self.process.returncode
        if self.returncode != 0:
            if _cfg("error_folder"):
                now = int(time.time())
                with open(os.path.join(_cfg("error_folder"), "error-log-%s.txt" % now), "w") as f:
                    f.write(" ".join(self.args) + "\n\n")

                    f.write(self.stdout)
                    f.write(self.stderr)
                    f.flush()
