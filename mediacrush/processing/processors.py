from mediacrush.processing.processor import Processor, UnrecognisedFormatException

copy = "cp {0} {1}.{extension}"

class VideoProcessor(Processor):
    time = 300
    outputs = ['mp4', 'webm', 'ogv']
    extras = ['png']

    def sync(self):
        self._execute(copy)
        map_string = ''
        if self.extra['has_video']:
            self._execute("ffmpeg -y -i {0} -vframes 1 -map 0:v:0 {1}.png")
            map_string += ' -map 0:v:0'
        if self.extra['has_audio']:
            map_string += ' -map 0:a:0'
        self._execute("ffmpeg -y -i {0} -vcodec libx264 -movflags faststart -acodec libfdk_aac -pix_fmt yuv420p -profile:v baseline -preset slower -crf 18 -vf scale=trunc(in_w/2)*2:trunc(in_h/2)*2" + map_string  + " {1}.mp4")
        self._execute("ffmpeg -y -i {0} -c:v libvpx -c:a libvorbis -pix_fmt yuv420p -quality good -b:v 2M -crf 5" + map_string + " {1}.webm")

    def async(self):
        map_string = ''
        if self.extra['has_video']:
            map_string += ' -map 0:v:0'
        if self.extra['has_audio']:
            map_string += ' -map 0:a:0'
        self._execute("ffmpeg -y -i {0} -q:v 5 -pix_fmt yuv420p -acodec libvorbis -vcodec libtheora" + map_string + " {1}.ogv")

class AudioProcessor(Processor):
    time = 300
    outputs = ['mp3', 'ogg']

    def sync(self):
        self._execute(copy)
        self._execute("ffmpeg -y -i {0} -acodec libmp3lame -q:a 0 -map 0:a:0 {1}.mp3")

    def async(self):
        self._execute("ffmpeg -y -i {0} -acodec libvorbis -q:a 10 -map 0:a:0 {1}.ogg")

class ImageProcessor(Processor):
    time = 60
    outputs = ['png']

    def sync(self):
        self._execute(copy)
        self._execute("convert {0} {1}.png")

    def async(self):
        self._execute("optipng -o5 {1}.png")

# We have some special optimizations for specific filetypes
# These customized processors follow

class PNGProcessor(Processor):
    time = 120
    outputs = ['png']

    def sync(self):
        self._execute(copy)

    def async(self):
        self._execute("optipng -o5 {1}.png")

class JPEGProcessor(Processor):
    time = 5
    outputs = ['jpg']

    def sync(self):
        self._execute("jpegtran -optimize -perfect -copy none -outfile {1}.{extension} {0}")

class SVGProcessor(Processor):
    time = 5
    outputs = []

    def sync(self):
        self._execute(copy)

    def async(self):
        self._execute("tidy -asxml -xml --hide-comments 1 --wrap 0 --quiet --write-back 1 {0}")

class XCFProcessor(Processor):
    time = 5
    outputs = ['png']

    def sync(self):
        self._execute(copy)
        self._execute('xcf2png {0} -o {1}.png')
    
    def async(self):
        self._execute('optipng -o5 {1}.png')

class DefaultProcessor(Processor):
    def sync(self):
        raise UnrecognisedFormatException # It shouldn't get to this point, but if it does, invalidate the file

processor_table = {
    'video': VideoProcessor,
    'audio': AudioProcessor,
    'image': ImageProcessor,
    'image/png': PNGProcessor,
    'image/jpeg': JPEGProcessor,
    'image/svg+xml': SVGProcessor,
    'image/x-gimp-xcf': XCFProcessor,
    'default': DefaultProcessor,
}

def get_processor(processor):
    return processor_table.get(processor, DefaultProcessor)
