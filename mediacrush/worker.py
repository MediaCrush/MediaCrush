import os
import tempfile
import subprocess
import shutil
import threading

from datetime import datetime

from .config import _cfg, _cfgi
from .database import r, _k
from .files import compression_rate, processing_needed, clean_extension, get_mimetype
from .objects import File

converters = {
    "video/mp4": lambda path, outputpath: TimeLimitedCommand(["ffmpeg", "-i", path, "-pix_fmt", "yuv420p", "-vf", "scale=trunc(in_w/2)*2:trunc(in_h/2)*2", outputpath]),
    "video/ogg": lambda path, outputpath: TimeLimitedCommand(["ffmpeg", "-i", path, "-q", "5", "-pix_fmt", "yuv420p", "-acodec", "libvorbis", outputpath]),
    "audio/mpeg": lambda path, outputpath: TimeLimitedCommand(["ffmpeg", "-i", path, outputpath]),
    "audio/ogg": lambda path, outputpath: TimeLimitedCommand(["ffmpeg", "-i", "-acodec", "libvorbis", path, outputpath])
}

processors = {
    "image/jpg": lambda path: TimeLimitedCommand(["jhead", "-purejpg", path, path]),
    "image/png": lambda path: TimeLimitedCommand(["optipng", "-o5", path]),
    "image/svg+xml": lambda path: TimeLimitedCommand(["tidy", "-asxml", "-xml", "--hide-comments", "1", "--wrap", "0", "--quiet", "--write-back", "1", path])
}

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


def process_gif(filename):
    print('Processing ' + filename)
    f = File.from_hash(filename)
    mimetype = get_mimetype(f.original)
    path = os.path.join(_cfg("storage_folder"), f.original)

    statuscode = 0
    exited = False
    start = datetime.now()

    # Check if we know how to treat this file
    if mimetype not in processing_needed:
        r.delete(_k("%s.lock" % filename))
        return

    try:
        config = processing_needed[mimetype]
        # Do processing
        if mimetype in processors:
            code, exit = processors[mimetype](path).run(timeout=config['time'])
            statuscode += code
            exited |= exit

        # Do conversions
        basepath = os.path.join(_cfg("storage_folder"), filename)
        for format in config["formats"]:
            outputpath = clean_extension(basepath, format)
            code, exit = converters[format](path, outputpath).run(timeout=config['time'])
            statuscode += code
            exited |= exit
    except Exception:
        statuscode += 1

    # Set the compression rate
    f.compression = compression_rate(filename)

    # Remove "processing lock"
    r.delete(_k("%s.lock" % filename))
    failed = False
    if statuscode != 0:
        r.set(_k("%s.error") % filename, "error")
        failed = True
    if exited:
        r.set(_k("%s.error") % filename, "timeout")
        failed = True

    # Remove artifacts if the conversion fails
    if failed:
        for format in config["formats"]:
            outputpath = clean_extension(basepath, format)
            if os.path.exists(outputpath):
                os.unlink(outputpath)

    # Save the file
    f.save()

    end = datetime.now()
    print("Processed %s %s" % (filename, end - start))
