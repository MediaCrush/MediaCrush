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

converters = {
    'mp4':  Invocation("ffmpeg -i {0} -vcodec libx264 -pix_fmt yuv420p -vf scale=trunc(in_w/2)*2:trunc(in_h/2)*2 {1}.mp4"),
    'ogv':  Invocation("ffmpeg -i {0} -q 5 -pix_fmt yuv420p -acodec libvorbis -vcodec libtheora {1}.ogv"),
    'webm': Invocation("ffmpeg -i {0} -c:v libvpx -c:a libvorbis -pix_fmt yuv420p -quality good -b:v 2M -crf 5 {1}.webm"),
    'mp3':  Invocation("ffmpeg -i {0} {1}.mp3"),
    'ogg':  Invocation("ffmpeg -i {0} -acodec libvorbis {1}.ogg"),
    'png':  Invocation("ffmpeg -i {0} -vframes 1 {1}.png")
}

processors = {
    'jpg': Invocation("jhead -purejpg {0} {0}"),
    'jpeg': Invocation("jhead -purejpg {0} {0}"),
    #'png': Invocation("optipng -o5 {0}"),
    'svg': Invocation("tidy -asxml -xml --hide-comments 1 --wrap 0 --quiet --write-back 1 {0}")
}

def process_gif(filename):
    print('Processing ' + filename)
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

    try:
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

        for conversion in config.get('extras', []):
            # Don't fail for extra conversions
            converters[conversion](path, outputpath).run(timeout=config['time'])
    except:
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
        for artifact_ext in config['formats']:
            path = outputpath + "." + artifact_ext
            if os.path.exists(path):
                os.unlink(path)

    # Save the file
    f.save()

    end = datetime.now()
    print("Processed %s %s" % (filename, end - start))
