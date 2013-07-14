import os
import tempfile
import subprocess
import shutil
import threading

from .config import _cfg
from .database import r, _k

class TimeLimitedCommand(object):
    def __init__(self, *args):
        self.args = args
        self.process = None
   
    def _target(self): 
        with open(os.devnull, "w") as devnull:
            self.process = subprocess.Popen(*self.args, stdout=devnull, stderr=devnull)
            self.process.communicate()

    def run(self, timeout=30):
        thread = threading.Thread(target=self._target)
        thread.start()
        thread.join(timeout)
        
        if thread.is_alive():
            print "Terminating process"
            self.process.terminate()
            thread.join() 

        return self.process.returncode

def process_gif(filename):
    path = os.path.join(_cfg("upload_folder"), filename + ".gif")
    
    # Generate videos
    outputpath = os.path.join(_cfg("processed_folder"), filename)
    TimeLimitedCommand(["ffmpeg", "-i", path, "-pix_fmt", "yuv420p", "-vf", "scale=trunc(in_w/2)*2:trunc(in_h/2)*2", "%s.mp4" % outputpath]).run()
    TimeLimitedCommand(["ffmpeg", "-i", path, "-q", "5", "-pix_fmt", "yuv420p", "%s.ogv" % outputpath]).run()

    # Remove "processing lock"
    r.delete(_k("%s.lock" % filename))
