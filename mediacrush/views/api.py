from flask.ext.classy import FlaskView, route
from flaskext.bcrypt import check_password_hash
from flask import request, current_app

from ..decorators import json_output, cors
from ..files import media_url, get_mimetype, extension, processing_needed, delete_file, upload, URLFile, processing_status
from ..database import r, _k
from ..objects import File, Album, Feedback, RedisObject
from ..network import get_ip, secure_ip
from ..ratelimit import rate_limit_exceeded, rate_limit_update

def _file_object(f):
    ext = extension(f.original)

    ret = {
        'original': media_url(f.original),
        'type': get_mimetype(f.original),
        'hash': f.hash,
        'files': [],
        'extras': []
    }
    if f.compression:
        ret['compression'] = float(f.compression)

    ret['files'].append(_file_entry(f.original))

    if ext in processing_needed:
        for f_ext in processing_needed[ext]['formats']:
            ret['files'].append(_file_entry("%s.%s" % (f.hash, f_ext)))
        for f_ext in processing_needed[ext].get('extras', []):
            ret['extras'].append(_file_entry("%s.%s" % (f.hash, f_ext)))

    return ret

def _file_entry(f):
    return {
        'type': get_mimetype(f),
        'file': media_url(f),
    }

def _album_object(a):
    ret = {
        'type': 'application/album',
        'hash': a.hash,
        'files': [],
    }

    for h in a.items:
        f = File.from_hash(h)
        ret['files'].append(_file_object(f))

    return ret

objects = {
    File: _file_object,
    Album: _album_object,
}

deletion_procedures = {
    File: delete_file,
    Album: lambda a: a.delete()
}

def _upload_f(f, filename):
    result = upload(f, filename)
    if not isinstance(result, tuple):
        return {'hash': result}
    else:
        h, status = result

        resp = {'error': status}
        if status == 409:
            f = _file_object(File.from_hash(h))

            resp[h] = f
            resp['hash'] = h

        return resp, status

class APIView(FlaskView):
    decorators = [json_output, cors]
    route_base = '/'

    @route("/api/album/create", methods=['POST'])
    def album(self):
        items = request.form['list'].split(",")

        for i in items:
            klass = RedisObject.klass(i)
            if klass == False: # Does not exist
                return {'error': 404}, 404
            if klass != File: # Wrong type
                return {'error': 415}, 415

        if len(items) > 50:
            return {'error': 413}, 413

        a = Album()
        a.items = items
        a.ip = secure_ip()
        a.save()

        return {"hash": a.hash}

    @route("/api/<id>")
    @route("/<id>.json")
    def get(self, id):
        klass = RedisObject.klass(id)

        if not klass:
            return {'error': 404}, 404

        o = klass.from_hash(id)
        return objects[klass](o)

    @route("/api/info")
    def info(self):
        if not "list" in request.args:
            return {'error': 400}, 400
        items = request.args['list'].split(',')

        res = {}
        for i in items:
            klass = RedisObject.klass(i)
            if not klass:
                res[i] = None
            else:
                o = klass.from_hash(i)
                res[i] = objects[klass](o)

        return res

    @route("/api/<h>/delete")
    def delete(self, h):
        klass = RedisObject.klass(h)

        if not klass:
            return {'error': 404}, 404
        try:
            o = klass.from_hash(h)
            if not check_password_hash(o.ip, get_ip()):
                return {'error': 401}, 401
        except:
            return {'error': 401}, 401

        deletion_procedures[klass](o)
        return {'status': 'success'}

    @route("/api/upload/file", methods=['POST'])
    def upload_file(self):
        f = request.files['file']

        return _upload_f(f, f.filename)

    @route("/api/upload/url", methods=['POST'])
    def upload_url(self):
        url = request.form['url']
        f = URLFile()

        try:
            success = f.download(url)
        except:
            return {'error': 400}, 400

        if not success:
            return {'error': 404}, 404

        return _upload_f(f, f.filename)

    @route("/api/<h>/status")
    def status(self, h):
        klass = RedisObject.klass(h)

        if not klass:
            return {'error': 404}, 404

        if klass is not File:
            return {'error': 415}, 415

        f = File.from_hash(h)
        ret = {'status': processing_status(h)}
        if ret['status'] == 'done':
            ret[h] = _file_object(f)

        return ret

    @route("/api/<h>/exists")
    def exists(self, h):
        if not File.exists(h):
            return {'exists': False}, 404

        return {'exists': True}

    @route("/api/feedback", methods=['POST'])
    def feedback(self):
        text = request.form.get('feedback')
        useragent = request.headers.get('User-Agent')

        if len(text) > 10000:
            return {'error': 413}, 413

        rate_limit_update(1, "feedback")
        if not current_app.debug and rate_limit_exceeded("feedback"):
            return {'error': 420}, 420

        feedback = Feedback(text=text, useragent=useragent)
        feedback.save()
        return {'status': 'success'}
