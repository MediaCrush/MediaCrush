from mediacrush.processing.processor import Processor, UnrecognisedFormatException
from mediacrush.mimeinfo import extension
from mediacrush.processing.invocation import Invocation
from mediacrush.config import _cfg
import os

copy = "cp {0} {1}.{extension}"
_extension = lambda f: f.rsplit('.', 1)[1].lower()

class VideoProcessor(Processor):
    time = 1200
    outputs = ['mp4', 'webm', 'ogv']
    extras = ['jpg']

    def sync(self):
        self._execute(copy)
        map_string = ''
        filter_string = 'scale=trunc(in_w/2)*2:trunc(in_h/2)*2'
        if self.processor_state['has_video']:
            self._execute("ffmpeg -y -i {0} -vframes 1 -map 0:v:0 {1}.jpg")
            map_string += ' -map 0:v:0'
        if self.processor_state['has_audio']:
            map_string += ' -map 0:a:0'
        if 'interlaced' in self.processor_state:
            print("WARNING: Detected interlacing on " + self.output)
            filter_string = 'yadif,' + filter_string
        self._execute("ffmpeg -y -i {0} -vcodec libx264 -acodec libfdk_aac -pix_fmt yuv420p -profile:v baseline -preset slower -crf 18 -vf " + filter_string + map_string  + " {1}.mp4")
        self._execute("ffmpeg -y -i {0} -c:v libvpx -c:a libvorbis -pix_fmt yuv420p -quality good -b:v 5M -crf 5 -vf " + filter_string + map_string + " {1}.webm")
        # Extract extra streams if present
        fonts = []
        extract_fonts = False
        if 'has_fonts' in self.processor_state and 'has_subtitles' in self.processor_state:
            if self.processor_state['has_fonts'] or self.processor_state['has_subtitles']:
                for stream in self.processor_state['streams']:
                    if stream['type'] == 'font':
                        ext = _extension(stream["info"])
                        if ext in ['ttf', 'otf']:
                            # Note that ffmpeg returns a nonzero exit code when dumping attachments because there's technically no output file
                            # -dump_attachment is a mechanism completely removed from the rest of the ffmpeg workflow
                            self._execute("ffmpeg -y -dump_attachment:" + str(stream["index"]) + ' {1}_attachment_' + str(len(fonts)) + '.' + ext + ' -i {0}', ignoreNonZero=True)
                            fonts.append(stream)
                    elif stream['type'] == 'subtitle' and 'info' in stream:
                        extension = None
                        if stream['info']['codec_name'] == 'ssa':
                            extension = '.ass'
                            extract_fonts = True
                        elif stream['info']['codec_name'] == 'srt':
                            extension = '.srt'
                        elif stream['info']['codec_name'] == 'vtt':
                            extension = '.vtt'
                        if extension != None:
                            self._execute("ffmpeg -y -i {0} -map 0:s:0 {1}" + extension)
                            if extension == '.srt':
                                # convert to vtt
                                vtt = convert_to_vtt(os.path.join(_cfg("storage_folder"), '%s.srt' % self.f.hash))
                                with open(os.path.join(_cfg("storage_folder"), '%s.vtt' % self.f.hash), 'w') as f:
                                    f.write(vtt)
                                os.remove(os.path.join(_cfg("storage_folder"), '%s.srt' % self.f.hash))
            if extract_fonts:
                # Examine font files and construct some CSS to import them
                css = ''
                i = 0
                for font in fonts:
                    ext = _extension(font['info'])
                    if not ext in ['ttf', 'otf']:
                        continue
                    command = Invocation('otfinfo --info {0}')
                    command(os.path.join(_cfg("storage_folder"), '%s_attachment_%s.%s' % (self.f.hash, i, _extension(font['info']))))
                    command.run()
                    output = command.stdout[0].split('\n')
                    family = None
                    subfamily = None
                    for line in output:
                        if line.startswith('Family:'):
                            family = line[7:].strip(' \t')
                        if line.startswith('Subfamily:'):
                            subfamily = line[10:].strip(' \t')
                    css += '@font-face{font-family: "%s";' % family
                    css += 'src:url("/%s_attachment_%s.%s");' % (self.f.hash, i, _extension(font['info']))
                    if subfamily == 'SemiBold':
                        css += 'font-weight: 600;'
                    elif subfamily == 'Bold':
                        css += 'font-weight: bold;'
                    elif subfamily == 'Italic':
                        css += 'font-style: italic;'
                    css += '}'
                    i += 1
                css_file = open(os.path.join(_cfg("storage_folder"), '%s_fonts.css' % self.f.hash), 'w')
                css_file.write(css)
                css_file.close()

    def async(self):
        map_string = ''
        if self.processor_state['has_video']:
            map_string += ' -map 0:v:0'
        if self.processor_state['has_audio']:
            map_string += ' -map 0:a:0'
        self._execute("ffmpeg -y -i {0} -q:v 5 -pix_fmt yuv420p -acodec libvorbis -vcodec libtheora" + map_string + " {1}.ogv")

class AudioProcessor(Processor):
    time = 600
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

def convert_to_vtt(path):
    srt = list()
    vtt = 'WEBVTT\n\n'
    mode = 0
    with open(path) as f:
        srt = f.readlines()
    for line in srt:
        l = line.rstrip()
        if mode == 0: # waiting on cue
            vtt += l + '\n'
            try:
                int(l.strip())
                mode += 1
            except: pass
        elif mode == 1: # Parsing timecode
            # The only difference between SRT and VTT timecodes is that VTT uses . instead of ,
            vtt += l.replace(',', '.') + '\n'
            mode += 1
        else: # inside of cue
            vtt += l + '\n'
            if l == '':
                mode = 0
    return vtt
