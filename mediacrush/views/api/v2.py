from flask.ext.classy import FlaskView, route

from mediacrush.decorators import json_output
from mediacrush.processing import get_processor
from mediacrush.fileutils import normalise_processor
from mediacrush.objects import RedisObject, File, FailedFile
from mediacrush.files import media_url, get_mimetype

import json

NOT_FOUND = {'status': 'not_found'}, 404

def _file_object(f):
    mimetype = f.mimetype
    processor = get_processor(f.processor)

    metadata = {}
    if f.metadata and f.metadata != 'None':
        metadata = json.loads(f.metadata)

    ret = {
        'original': media_url(f.original),
        'blob_type': normalise_processor(f.processor),
        'hash': f.hash,
        'files': [],
        'extras': [],
        'metadata': metadata,
        'flags': f.flags.as_dict(),
        'status': f.status
    }
    if f.compression:
        ret['compression'] = float(f.compression)
    if f.status in ['error', 'timeout', 'unrecognized']:
        # TODO: We should not use magic strings here, but instead we should modify the processing pipeline
        ret['status'] = 'error'
        ret['error'] = f.status

    ret['files'].append(_file_entry(f.original, mimetype=f.mimetype))

    for f_ext in processor.outputs:
        name = "%s.%s" % (f.hash, f_ext)
        if name == f.original:
            continue

        ret['files'].append(_file_entry(name))
    for f_ext in processor.extras:
        ret['extras'].append(_file_entry("%s.%s" % (f.hash, f_ext)))

    return ret

def _file_entry(f, mimetype=None):
    return {
        'type': mimetype if mimetype else get_mimetype(f),
        'url': media_url(f)
    }

_objects = {
    File: _file_object
}

class APIv2(FlaskView):
    decorators = [json_output] # TODO: `cors_v2`

    def get(self, q):
        hashes = q.split(",")
        ret = []

        for hash in hashes:
            klass = RedisObject.klass(hash)
            if not klass:
                return NOT_FOUND

            obj = klass.from_hash(hash)
            if klass is FailedFile:
                # TODO: Composing this manually may not be the best idea
                ret.append({ "status": "error", "hash": hash, "error": obj.status })
            else:
                ret.append(_objects[klass](obj))

        return {'list': ret}
