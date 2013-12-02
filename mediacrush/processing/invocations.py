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

# Video-related invocations
mp4 = Invocation("ffmpeg -i {0} -vcodec libx264 -pix_fmt yuv420p -vf scale=trunc(in_w/2)*2:trunc(in_h/2)*2 {1}.mp4")
webm = Invocation("ffmpeg -i {0} -c:v libvpx -c:a libvorbis -pix_fmt yuv420p -quality good -b:v 2M -crf 5 {1}.webm")
ogv = Invocation("ffmpeg -i {0} -q 5 -pix_fmt yuv420p -acodec libvorbis -vcodec libtheora {1}.ogv")
mp3 = Invocation("ffmpeg -i {0} {1}.mp3")
ogg = Invocation("ffmpeg -i {0} -acodec libvorbis {1}.ogg")
png_frame = Invocation("ffmpeg -i {0} -vframes 1 {1}.png")

# Image-related invocations
jpeg = Invocation("jhead -purejpg {0} {0}")
svg = Invocation("tidy -asxml -xml --hide-comments 1 --wrap 0 --quiet --write-back 1 {0}")
png_still = Invocation("optipng -o5 {0}")
