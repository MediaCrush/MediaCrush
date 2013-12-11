from mediacrush.processing.invocations import *
from mediacrush.processing.processor import Processor

class VideoProcessor(Processor):
    time = 300

    def sync(self):
        self._execute(mp4)
        self._execute(webm)
        self._execute(ogv)
        self._execute(copy)

    def async(self):
        self._execute(png_frame)

class JPEGProcessor(Processor):
    time = 5

    def sync(self):
        self._execute(jpeg)

class SVGProcessor(Processor):
    time = 5

    def sync(self):
        self._execute(svg)

class DefaultProcessor(Processor):
    time = 5

    def sync(self):
        self._execute(copy)

processor_table = {
    'video': VideoProcessor,
    'image/jpeg': JPEGProcessor,
    'image/svg+xml': SVGProcessor,
    'default': DefaultProcessor,
}
