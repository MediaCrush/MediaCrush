from flask.ext.classy import FlaskView, route
from flaskext.bcrypt import check_password_hash
from flask import request, current_app, redirect

from mediacrush.decorators import json_output, cors
from mediacrush.files import media_url, get_mimetype, extension, delete_file, upload, URLFile
from mediacrush.database import r, _k
from mediacrush.objects import File, Album, Feedback, RedisObject, FailedFile, CryptoAccount
from mediacrush.network import get_ip, secure_ip
from mediacrush.ratelimit import rate_limit_exceeded, rate_limit_update
from mediacrush.processing import get_processor
from mediacrush.fileutils import normalise_processor
from mediacrush.config import _cfg
from mediacrush.tor import tor_redirect

import json

def _file_object(f):
    mimetype = f.mimetype
    processor = get_processor(f.processor)

    metadata = {}
    if f.metadata and f.metadata != 'None':
        metadata = json.loads(f.metadata)
    ret = {
        'original': media_url(f.original, absolute=False),
        'type': mimetype,
        'blob_type': normalise_processor(f.processor),
        'hash': f.hash,
        'files': [],
        'extras': [],
        'metadata': metadata,
        'flags': f.flags.as_dict(),
    }
    if f.compression:
        ret['compression'] = float(f.compression)

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
        'file': media_url(f, absolute=False), # This silliness will be fixed in API 2
        'url': media_url(f)
    }

def _album_object(a):
    ret = {
        'type': 'application/album',
        'hash': a.hash,
        'files': [],
    }

    if not a.items:
        return {'error': 404}, 404

    for f in a.items:
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

def _upload_object(result, status):
    if status == 200:
        return {'hash': result}
    else:
        resp = {'error': status}
        if status == 409:
            f = _file_object(File.from_hash(result))

            resp[result] = f
            resp['hash'] = result

        return resp, status

class APIView(FlaskView):
    decorators = [json_output, cors]
    route_base = '/'

    @route("/api/album/create", methods=['POST'])
    def album(self):
        items = request.form['list'].split(",")

        for i in items:
            klass = RedisObject.klass(i)
            if not klass: # Does not exist
                return {'error': 404}, 404
            if klass != File: # Wrong type
                return {'error': 415}, 415

        if len(items) > 1024:
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

    @route("/api/<h>", methods=['DELETE'])
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

    @route("/api/<h>/delete")
    def delete_human(self, h):
        # TODO(jdiez): remove this when it's safe to do so
        return redirect('/%s/delete' % h)


    @route("/api/info")
    def info(self):
        if not "list" in request.args:
            return {'error': 400}, 400
        items = request.args['list'].split(',')

        res = {}
        for i in items:
            klass = RedisObject.klass(i)
            if not klass or klass not in objects:
                res[i] = None
            else:
                o = klass.from_hash(i)
                res[i] = objects[klass](o)

        return res

    @route("/api/upload/noscript", methods=['POST'])
    def upload_noscript(self):
        f = request.files['file']
        filename = ''.join(c for c in f.filename if c.isalnum() or c == '.')

        identifier, code = upload(f, filename)
        if not code in [ 200, 409 ]:
            return { 'error': code }, code
        return tor_redirect("/status/" + identifier)

    @route("/api/upload/file", methods=['POST'])
    def upload_file(self):
        f = request.files['file']
        filename = ''.join(c for c in f.filename if c.isalnum() or c == '.')

        return _upload_object(*upload(f, filename))

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

        result, status = upload(f, f.filename)
        r.set(_k("url.%s" % url), result)

        return _upload_object(result, status)

    @route("/api/url/info", methods=['POST'])
    def urlinfo(self):
        l = request.form['list']
        items = l.split(",") if "," in l else [l]

        result = {}
        for item in items:
            key = _k("url.%s" % item)
            h = r.get(key)
            if h:
                f = File.from_hash(h)
                if f:
                    result[item] = _file_object(f)
                else:
                    result[item] = None
                    r.delete(key)
            else:
                result[item] = None

        return result

    @route("/api/<h>/status")
    def status(self, h):
        klass = RedisObject.klass(h)

        if not klass:
            return {'error': 404}, 404

        if klass is FailedFile:
            ff = klass.from_hash(h)
            return {'status': ff.status}

        if klass is not File:
            return {'error': 415}, 415

        f = File.from_hash(h)
        ret = {'status': f.status}
        if f.processor is not None: # When processor is available, ther rest of the information is too, even if the file might not have finished processing yet.
            ret[h] = _file_object(f)
            ret['hash'] = h

        return ret

    @route("/api/status")
    def status_bulk(self):
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
                res[i] = {'status': o.status}
                if klass is not FailedFile:
                    res[i]['file'] = _file_object(o)

        return res

    @route("/api/<h>/exists")
    def exists(self, h):
        if not File.exists(h):
            return {'exists': False}, 404

        return {'exists': True}

    @route("/api/<h>/flags")
    def flags(self, h):
        if not File.exists(h):
            return {'error': 404}, 404

        f = File.from_hash(h)
        return {'flags': f.flags.as_dict()}

    @route("/api/<h>/flags", methods=['POST'])
    def flags_post(self, h):
        klass = RedisObject.klass(h)

        if not klass:
            return {'error': 404}, 404
        try:
            o = klass.from_hash(h)
            if not check_password_hash(o.ip, get_ip()):
                return {'error': 401}, 401
        except:
            return {'error': 401}, 401

        # At this point, we're authenticated and o is the object.
        for flag, value in request.form.items():
            v = True if value == 'true' else False

            try:
                setattr(o.flags, flag, v)
            except AttributeError:
                return {'error': 415}, 415

        o.save()

        return {"flags": o.flags.as_dict()}


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

    @route("/api/aes/<userhash>", methods=['GET'])
    def get_aesblob(self, userhash):
        if not CryptoAccount.exists(userhash):
            return {'error': 404}, 404

        account = CryptoAccount.from_hash(userhash)
        return {'blob': account.blob}

    @route("/api/aes/<userhash>", methods=['PUT'])
    def put_account(self, userhash):
        if 'blob' not in request.form or 'token' not in request.form:
            return {'error': 400}, 400

        token = request.form['token']
        blob = request.form['blob']

        if CryptoAccount.exists(userhash):
            account = CryptoAccount.from_hash(hash=userhash)
            if account.check_token(token):
                account.blob = blob # TODO: blob limits
                account.save()

                return {'status': 'success'}
            else:
                return {'error': 401}, 401

        # TODO: blob limits
        account = CryptoAccount(hash=userhash, blob=blob)
        account.hash_token(token)
        account.save()

        return {'status': 'success'}

    # This is a POST method because we require a 'token' form parameter.
    # DELETE ignores the entity body, so we can't use that.
    # Suggestions are welcome.
    @route("/api/aes/delete/<userhash>", methods=['POST'])
    def delete_account(self, userhash):
        if 'token' not in request.form:
            return {'error': 400}, 400

        token = request.form['token']

        if not CryptoAccount.exists(userhash):
            return {'error': 404}, 404

        account = CryptoAccount.from_hash(userhash)
        if account.check_token(token):
            account.delete()

            return {'status': 'success'}
        else:
            return {'error': 401}, 401
