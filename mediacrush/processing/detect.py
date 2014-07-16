from mediacrush.processing.invocation import Invocation
from mediacrush.config import _cfg, _cfgi
import sys
import json
import re

# Given a file, this will examine it to learn all of its secrets. It will identify the
# file type, and for certain files, will gather more details about it. It works by
# examining file contents - it does not depend on the extension or mimetype to be
# accurate. It will return something like this:
#
#   {
#       'type': '...', # video, audio, image, or a mimetype
#       'metadata': { ... }, # metadata like image dimensions or container info
#       'processor_state': { ... }, # info to be passed along to processors
#       'flags': { ... } # Default flags for this media type (like autoplay or loop)
#   }
#
# The type is only a full-blown mimetype for a limited number of file formats:
#   - image/png
#   - image/jpeg
#   - image/svg+xml
#   - image/x-gimp-xcf
#   - text/plain
#   - text/x-*** (example: text/x-python - not guaranteed to be very accurate)
#
# Note that MediaCrush itself doesn't actually do anything with plaintext files yet.
#
# Video/audio is only returned if ffmpeg can handle it. 'image' is only returned if
# ImageMagick can handle it.

def detect(path):
    result = detect_ffprobe(path)
    if result != None:
        return result
    result = detect_imagemagick(path)
    if result != None:
        return result
    result = detect_plaintext(path)
    if result != None:
        return result
    return None

# This does *not* work with any containers that only have images in them, by design.
def detect_ffprobe(path):
    a = Invocation('ffprobe -print_format json -loglevel quiet -show_format -show_streams {0}')
    a(path)
    a.run()
    if a.returncode or a.exited:
        return None
    result = json.loads(a.stdout[0])

    audio_streams = 0
    video_streams = 0
    image_streams = 0
    subtitle_streams = 0
    font_streams = 0
    # We shouldn't penalize people for unknown streams, I just figured we could make a note of it
    unknown_streams = 0

    metadata = dict()
    state = dict()
    flags = dict()
    state['streams'] = list()
    index = 0

    for stream in result["streams"]:
        s = detect_stream(stream)
        if s == None:
            continue
        # Set up some metadata
        if s['metadata'] != None:
            if 'duration' in s['metadata']:
                metadata['duration'] = s['metadata']['duration']
            if 'dimensions' in s['metadata']:
                metadata['dimensions'] = s['metadata']['dimensions']
        t = s['type']
        if not s or not t:
            unknown_streams += 1
        else:
            state['streams'].append({
                'type': t,
                'info': s['processor_state'],
                'index': index
            })
            if t.startswith('image'):
                image_streams += 1
            elif t == 'video':
                video_streams += 1
                flags = s['flags']
            elif t == 'audio':
                audio_streams += 1
            elif t == 'subtitle':
                subtitle_streams += 1
            elif t == 'font':
                font_streams += 1
            else:
                unknown_streams += 1
        index += 1
    metadata = ffprobe_addExtraMetadata(metadata, result)
    if audio_streams == 1 and video_streams == 0:
        metadata['has_audio'] = True
        metadata['has_video'] = False
        state['has_audio'] = True
        state['has_video'] = False
        return {
            'type': 'audio',
            'processor_state': state,
            'metadata': metadata,
            'flags': None
        }
    if video_streams > 0:
        metadata['has_audio'] = audio_streams > 0
        metadata['has_video'] = True
        metadata['has_subtitles'] = subtitle_streams > 0
        state['has_audio'] = audio_streams > 0
        state['has_video'] = True
        state['has_fonts'] = font_streams > 0
        state['has_subtitles'] = subtitle_streams > 0
        if subtitle_streams > 0:
            metadata = addSubtitleInfo(metadata, state)
        if detect_interlacing(path):
            state['interlaced'] = True
        return {
            'type': 'video',
            'processor_state': state,
            'metadata': metadata,
            'flags': flags
        }
    return None

def detect_interlacing(path):
    a = Invocation('ffmpeg -vf idet -vframes 100 -an -f rawvideo -y /dev/null -i {0}')
    a(path)
    a.run()
    if a.returncode or a.exited:
        return False
    result = a.stdout[1].split('\n')
    for line in result:
        if line.startswith('[Parsed_idet_'):
            match = re.search('TFF:([0-9]+) BFF:([0-9]+) Progressive:([0-9]+) Undetermined:([0-9]+)', line)
            if match == None:
                return False
            tff = float(match.group(1))
            bff = float(match.group(2))
            progressive = float(match.group(3))
            undetermined = float(match.group(4))
            total = tff + bff + progressive + undetermined
            if total == 0:
                return False
            tff = tff / total
            bff = bff / total
            progressive = progressive / total
            undetermined = undetermined / total
            if undetermined < 0.05 and progressive < 0.8:
                if tff >= 0.8 or bff >= 0.8:
                    # It's probably interlaced.
                    return True
    return False

def addSubtitleInfo(metadata, state):
    metadata['subtitles'] = {
        'fonts': [],
        'streams': []
    }
    for stream in state['streams']:
        if stream['type'] == 'subtitle':
            metadata['subtitles']['streams'].append(stream)
        if stream['type'] == 'font':
            metadata['subtitles']['fonts'].append(stream['info'])
    return metadata

def ffprobe_addExtraMetadata(metadata, result):
    if 'format' in result:
        f = result['format']
        if 'tags' in f:
            t = f['tags']
            if 'ALBUM' in t:
                metadata['album'] = t['ALBUM']
            if 'album' in t:
                metadata['album'] = t['album']
            if 'COMPOSER' in t:
                metadata['composer'] = t['COMPOSER']
            if 'composer' in t:
                metadata['composer'] = t['composer']
            if 'ARTIST' in t:
                metadata['artist'] = t['ARTIST']
            if 'artist' in t:
                metadata['artist'] = t['artist']
            if 'TITLE' in t:
                metadata['title'] = t['TITLE']
            if 'title' in t:
                metadata['title'] = t['title']
    return metadata

def detect_stream(stream):
    if not "codec_name" in stream or stream["codec_name"] == "attachment":
        if "tags" in stream and "mimetype" in stream["tags"]:
            if stream["tags"]["mimetype"] == 'application/x-truetype-font' or stream["tags"]["mimetype"] == "application/vnd.ms-opentype":
                return {
                    'type': 'font',
                    'processor_state': stream["tags"]["filename"],
                    'metadata': None,
                    'flags': None
                }
    else:
        if stream["codec_name"] == 'mjpeg':
            return {
                'type': 'image/jpeg',
                'metadata': { 'dimensions': { 'width': int(stream['width']), 'height': int(stream['height']) } },
                'processor_state': None,
                'flags': None
            }
        if stream["codec_name"] == 'png':
            return {
                'type': 'image/png',
                'metadata': { 'dimensions': { 'width': int(stream['width']), 'height': int(stream['height']) } },
                'processor_state': None,
                'flags': None
            }
        if stream["codec_name"] == 'webp':
            return {
                'type': 'image',
                'metadata': { 'dimensions': { 'width': int(stream['width']), 'height': int(stream['height']) } },
                'processor_state': None,
                'flags': None
            }
        if stream["codec_name"] == 'bmp':
            return None
        if stream["codec_name"] == 'gif':
            return {
                'type': 'video',
                'metadata': { 'has_audio': False, 'has_video': True, 'dimensions': { 'width': int(stream['width']), 'height': int(stream['height']) } },
                'processor_state': { 'has_audio': False, 'has_video': True },
                'flags': {
                    'autoplay': True,
                    'loop': True,
                    'mute': True
                }
            }
    if stream["codec_type"] == 'video':
        return {
            'type': 'video',
            'metadata': { 'dimensions': { 'width': int(stream['width']), 'height': int(stream['height']) } },
            'processor_state': { 'has_audio': False, 'has_video': True, 'video_codec': stream['codec_name'] },
            'flags': {
                'autoplay': False,
                'loop': False,
                'mute': False
            }
        }
    if stream["codec_type"] == 'audio':
        language = None
        if "tags" in stream and "LANGUAGE" in stream["tags"]:
            language = stream["tags"]["LANGUAGE"]
        duration = None
        if "duration" in stream:
            duration = float(stream["duration"])
        return {
            'type': 'audio',
            'metadata': { 'duration': duration, 'language': language },
            'processor_state': { 'has_audio': True, 'has_video': False },
            'flags': None
        }
    if stream["codec_type"] == 'subtitle':
        default = False
        language = None
        if "disposition" in stream and "default" in stream["disposition"]:
            default = stream["disposition"]["default"] == 1
        if "tags" in stream and "language" in stream["tags"]:
            language = stream["tags"]["language"]
        codec_name = stream["codec_name"]
        if codec_name == "subrip":
            codec_name = 'srt' # This one makes more sense, and is consistent with vtt
        return {
            'type': 'subtitle',
            'metadata': { 'default': default, 'language': language },
            'processor_state': { 'codec_name': codec_name, 'default': default },
            'flags': None
        }
    return None

def detect_imagemagick(path):
    a = Invocation('identify -verbose {0}')
    a(path)
    a.run()
    try:
        result = a.stdout[0].split('\n')
        # Get mime type and dimensions
        mimetype = None
        metadata = None
        for line in result:
            line = line.lstrip(' ')
            if line.startswith('Mime type: '):
                mimetype = line[11:]
            match = re.search('(\d+)x(\d+)', line)
            if line.startswith('Geometry: '):
                metadata = { 'dimensions': { 'width': int(match.group(1)), 'height': int(match.group(2)) } }
        if mimetype in [ 'image/png', 'image/jpeg', 'image/svg+xml' ]:
            return {
                'type': mimetype,
                'metadata': metadata,
                'processor_state': None,
                'flags': None
            }
        # Check for other formats
        for line in result:
            line = line.lstrip(' ')
            if line == 'Format: XCF (GIMP image)':
                return {
                    'type': 'image/x-gimp-xcf',
                    'metadata': metadata,
                    'processor_state': None,
                    'flags': None
                }

        return {
            'type': 'image',
            'metadata': metadata,
            'processor_state': None,
            'flags': None
        }
    except:
        return None

def detect_plaintext(path):
    a = Invocation('file -b -e elf -e tar -e compress -e cdf -e apptype -i {0}')
    a(path)
    a.run()
    if a.returncode or a.exited:
        return None
    result = a.stdout[0]
    if result.startswith('text/x-') or result == 'text/plain':
        return {
            'type': result[:result.find(';')],
            'metadata': None,
            'processor_state': None,
            'flags': None
        }
    return None
