import os
import tempfile
import subprocess
import shutil
import threading

from .config import _cfg

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

def process_gif(filename, quality):
    path = os.path.join(_cfg("upload_folder"), filename + ".gif")
    folder = tempfile.mkdtemp()
    
    # Generate videos
    outputpath = os.path.join(_cfg("processed_folder"), filename)
    for ext in ["ogv", "mp4"]:
        TimeLimitedCommand(["ffmpeg", "-i", path, "-q", quality, "-pix_fmt", "yuv420p", "%s.%s" % (outputpath, ext)]).run()

    # Delete temporary folder
    shutil.rmtree(folder)
