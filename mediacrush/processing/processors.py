from mediacrush.processing.invocations import *
from mediacrush.processing.processor import Processor

class GIFProcessor(Processor):
    sync = [mp4, webm, ogv]
    async = [png_frame]
    time = 300

class MP4Processor(Processor):
    sync = [webm, ogv]
    async = [png_frame]
    time = 600

class WebMProcessor(Processor):
    sync = [mp4, ogv]
    async = [png_frame]
    time = 600

class OGVProcessor(Processor):
    sync = [webm, mp4]
    async = [png_frame]
    time = 600

class JPEGProcessor(Processor):
    async = [jpeg]
    time = 5

class SVGProcessor(Processor):
    async = [svg]
    time = 5

processor_table = {
    'image/gif': GIFProcessor,
    'video/mp4': MP4Processor,
    'video/webm': WebMProcessor,
    'video/ogg': OGVProcessor,
    'image/jpeg': JPEGProcessor,
    'image/svg+xml': SVGProcessor,
}
