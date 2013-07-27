import os
import tempfile
import subprocess
import shutil
import threading

from datetime import datetime

from .config import _cfg, _cfgi
from .database import r, _k
from .files import processing_needed, extension, compression_rate
from .objects import File

converters = {
    'mp4': lambda path, outputpath: TimeLimitedCommand(["ffmpeg", "-i", path, "-pix_fmt", "yuv420p", "-vf", "scale=trunc(in_w/2)*2:trunc(in_h/2)*2", "%s.mp4" % outputpath]),
    'ogv': lambda path, outputpath: TimeLimitedCommand(["ffmpeg", "-i", path, "-q", "5", "-pix_fmt", "yuv420p", "%s.ogv" % outputpath]),
}

processors = {
    'jpg': lambda path: TimeLimitedCommand(["jhead", "-purejpg", path, path]),
    'jpeg': lambda path: TimeLimitedCommand(["jhead", "-purejpg", path, path]),
    'svg': lambda path: TimeLimitedCommand(["tidy", "-asxml", "-xml", "--hide-comments", "1", "--wrap", "0", "--quiet", "--write-back", "1", path])
}

class TimeLimitedCommand(object):

    def __init__(self, *args):
        self.args = args
        self.process = None

    def _target(self):
        with open(os.devnull, "w") as devnull:
            self.process = subprocess.Popen(
                *self.args, stdout=devnull, stderr=devnull)
            self.process.communicate()

    def run(self, timeout=_cfgi("max_processing_time")):
        exited = False

        thread = threading.Thread(target=self._target)
        thread.start()
        thread.join(timeout)

        if thread.is_alive():
            print "Terminating process"
            self.process.terminate()
            thread.join()
            exited = True
    
        if self.process == None:
            return 0, exited
        return self.process.returncode, exited


def process_gif(filename):
    f = File.from_hash(filename) 
    ext = extension(f.original)
    path = os.path.join(_cfg("storage_folder"), f.original)

    statuscode = 0
    exited = False
    start = datetime.now()

    # Check if we know how to treat this file
    if ext not in processing_needed:
        r.delete(_k("%s.lock" % filename))
        return

    config = processing_needed[ext]
    # Do processing
    if ext in processors:
        code, exit = processors[ext](path).run(timeout=config['time'])
        statuscode += code
        exited |= exit

    # Do conversions
    outputpath = os.path.join(_cfg("storage_folder"), filename)
    for conversion in config['formats']:
        code, exit = converters[conversion](path, outputpath).run(timeout=config['time'])
        statuscode += code
        exited |= exit

    # Set the compression rate
    f.compression = compression_rate(filename)

    # Remove "processing lock"
    r.delete(_k("%s.lock" % filename))
    failed = False
    if statuscode != 0:
        r.set(_k("%s.error") % filename, "status")
        failed = True
    if exited:
        r.set(_k("%s.error") % filename, "timeout")
        failed = True

    # Remove artifacts if the conversion fails
    if failed:
        for artifact_ext in config['formats']:
            path = outputpath + "." + artifact_ext
            if os.path.exists(path):
                os.unlink(path)

    # Save the file
    f.save()

    end = datetime.now()
    print "Processed", filename, end - start
