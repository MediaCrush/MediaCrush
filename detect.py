from mediacrush.processing.invocation import Invocation
from mediacrush.config import _cfg, _cfgi
import sys
import json

# This does file type detection by inspection rather than extensions
# It will return 'video' or 'audio' for anything ffmpeg supports
# It will return the full mimetype for PNG, JPG, BMP, and SVG files, which we have
# special procedures to optimize
# It will return 'image' for all other images that imagemagick supports
# It will return None for things we can't handle

# The first goal is to detect files via inspection so that we aren't dependent on
# extensions, and so that we can catch naughty files before we even try to process them
# The second goal is to hopefully have support for far more media types. This should
# allow us to broaden our supported media types to support basically everything.
# We need to convert uploaded media to browser-friendly formats. We can do videos and
# audio with ffmpeg, and we can do images with imagemagick.
def detect(path, suggestion):
    result = detect_ffprobe(path, suggestion)
    if result:
        return result
    # ffprobe can't identify images without examining the extensions, and doesn't
    # support SVG at all
    # Note that ffprobe *can* confirm the integrity of images if it knows the extension
    # first, so we allow it to resolve images if the provided extension makes sense.
    result = detect_imagemagick(path, suggestion)
    if result:
        return result
    return None

# This does *not* work with any containers that only have images in them, by design.
def detect_ffprobe(path, suggestion):
    # IMPORTANT: jdiez, this doesn't work when the path has spaces in it
    # I tried wrapping {0} in quotes to no avail
    a = Invocation('ffprobe -print_format json -loglevel quiet -show_format -show_streams {0}')
    a(path)
    a.run()
    if a.returncode or a.exited:
        return None
    result = json.loads(a.stdout[0])
    if result["format"]["nb_streams"] == 1:
        return detect_stream(result["streams"][0])
    # Try to guess what it is from the streams inside
    # I've done a little more detection than we really need to, for things like subtitles
    audio_streams = 0
    video_streams = 0
    image_streams = 0
    subtitle_streams = 0
    font_streams = 0
    # We shouldn't penalize people for unknown streams, I just figured we could make a note of it
    unknown_streams = 0

    for stream in result["streams"]:
        s = detect_stream(stream)
        if not s:
            unknown_streams += 1
        else:
            if s.startswith('image'):
                image_streams += 1
            elif s == 'video':
                video_streams += 1
            elif s == 'audio':
                audio_streams += 1
            elif s == 'subtitle':
                subtitle_streams += 1
            elif s == 'font':
                font_streams += 1
            else:
                unknown_streams += 1
    if audio_streams == 1 and video_streams == 0:
        return 'audio'
    if video_streams > 0:
        return 'video'
    return None

def detect_stream(stream):
    # This will return None for things it doesn't recognize, or:
    # 'image/whatever' (uses full mimetype for images)
    # 'video'
    # 'audio'
    # 'subtitle'
    # 'font'
    if not "codec_name" in stream:
        if "tags" in stream and "mimetype" in stream["tags"]:
            if stream["tags"]["mimetype"] == 'application/x-truetype-font':
                return 'font'
    if stream["codec_name"] == 'mjpeg':
        return 'image/jpeg'
    if stream["codec_name"] == 'png':
        return 'image/png'
    if stream["codec_name"] == 'bmp':
        return 'image/bmp'
    if stream["codec_type"] in [ 'video', 'audio' ]:
        return stream["codec_type"]
    return None

def detect_imagemagick(path, suggestion):
    a = Invocation('identify -verbose {0}')
    a(path)
    a.run()
    if a.returncode or a.exited:
        return None
    result = a.stdout[0].split('\n')
    # Check for an actual mimetype first
    mimetype = None
    for line in result:
        line = line.lstrip(' ')
        if line.startswith('Mime type: '):
            mimetype = line[11:]
    if mimetype in [ 'image/png', 'image/jpeg', 'image/bmp' ]:
        return mimetype
    # Check for SVG, it's special
    for line in result:
        line = line.lstrip(' ')
        if line ==  'Format: SVG (Scalable Vector Graphics)':
            return 'image/svg+xml'
    return 'image'

print detect(sys.argv[1])
