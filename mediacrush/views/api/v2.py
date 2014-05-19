from flask.ext.classy import FlaskView, route
from flaskext.bcrypt import check_password_hash
from flask import request

from mediacrush.decorators import json_output
from mediacrush.processing import get_processor
from mediacrush.fileutils import normalise_processor
from mediacrush.objects import RedisObject, File, FailedFile, Album
from mediacrush.files import media_url, get_mimetype, delete_file, upload
from mediacrush.network import get_ip, secure_ip

import json

NOT_FOUND = lambda hash: {"hash": hash, "result": "not_found"}
UNAUTHORIZED = lambda hash: {"hash": hash, "result": "unauthorized"}
SUCCESS = lambda hash: {"hash": hash, "result": "success"}
OBJ_ERROR = lambda obj: {"hash": obj.hash, "result": obj.status}
ERROR = lambda err: {"result": err}

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

def _upload_object(result, status):
    print result, status
    if status == 200:
        return SUCCESS(result)
    else:
        errors = {
            420: "ratelimit",
            415: "bad_format"
        }

        if status == 409:
            return _file_object(File.from_hash(result))

        resp = {'result': errors[result]}
        return resp


_objects = {
    File: _file_object
}

_deletion_funcs = {
    File: delete_file,
    Album: lambda a: a.delete()
}

class APIv2(FlaskView):
    decorators = [json_output] # TODO: `cors_v2`

    def get(self, q):
        hashes = q.split(",")
        ret = []

        for hash in hashes:
            klass = RedisObject.klass(hash)
            if not klass:
                ret.append(NOT_FOUND(hash))
                continue

            obj = klass.from_hash(hash)
            if klass is FailedFile:
                ret.append(OBJ_ERROR(obj))
            else:
                ret.append(_objects[klass](obj))

        return {'result': ret}

    def delete(self, q):
        hashes = q.split(",")
        ret = []

        for hash in hashes:
            klass = RedisObject.klass(hash)

            if not klass:
                ret.append(NOT_FOUND(hash))
                continue

            try:
                o = klass.from_hash(hash)
                if not check_password_hash(o.ip, get_ip()):
                    ret.append(UNAUTHORIZED(hash))

                _deletion_funcs[klass](o)
                ret.append(SUCCESS(hash))
            except:
                ret.append(UNAUTHORIZED(hash))

        return {'result': ret}

    @route("/upload", methods=['POST'])
    def upload(self):
        if "file" in request.files:
            f = request.files['file']
            filename = ''.join(c for c in f.filename if c.isalnum() or c == '.')

            return _upload_object(*upload(f, filename))
        else:
            # Upload from URL: TODO
            pass

    @route("/album", methods=['POST'])
    def album(self):
        if "items" not in request.form:
            return ERROR("bad_request")

        hashes = request.form["items"].split(",")
        if len(hashes) > 1024:
            return ERROR("too_big")

        for hash in hashes:
            klass = RedisObject.klass(hash)

            if klass is not File:
                return ERROR("bad_hash")

        a = Album()
        a.items = hashes
        a.ip = secure_ip()
        a.save()

        return SUCCESS(a.hash)

