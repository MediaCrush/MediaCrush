from mediacrush.objects import File
from mediacrush.database import r, _k
from mediacrush.processing.detect import detect
from mediacrush.mimetypes import get_mimetype, extension
from mediacrush.files import file_storage

if __name__ == '__main__':
    for h in r.smembers(_k("file")):
        f = File.from_hash(h)

        ext = extension(f.original)
        overrides = {
            'jpe': 'image/jpeg',
            'ogg': 'audio/ogg',
        }

        processor, extra = detect(file_storage(f.original))

        f.mimetype = overrides.get(ext, get_mimetype(f.original))
        f.processor = processor

        f.save()
