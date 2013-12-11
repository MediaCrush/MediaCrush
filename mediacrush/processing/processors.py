from mediacrush.processing.invocations import *
from mediacrush.processing.processor import Processor

#class GIFProcessor(Processor):
#    sync = [mp4, webm, ogv]
#    async = [png_frame]
#    time = 300
#
#class MP4Processor(Processor):
#    sync = [webm, ogv]
#    async = [png_frame]
#    time = 600
#
#class WebMProcessor(Processor):
#    sync = [mp4, ogv]
#    async = [png_frame]
#    time = 600
#
#class OGVProcessor(Processor):
#    sync = [webm, mp4]
#    async = [png_frame]
#    time = 600
#
#class JPEGProcessor(Processor):
#    async = [jpeg]
#    time = 5
#
#class SVGProcessor(Processor):
#    async = [svg]
#    time = 5

class VideoProcessor(Processor):
    time = 300

    def sync(self):
        self._execute(mp4)
        self._execute(webm)
        self._execute(ogv)

    def async(self):
        self._execute(png_frame)

processor_table = {
    'video': VideoProcessor
}
