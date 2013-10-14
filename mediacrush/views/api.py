from flask.ext.classy import FlaskView, route
from flaskext.bcrypt import check_password_hash 
from flask import request

from ..decorators import json_output, cors
from ..files import media_url, get_mimetype, extension, processing_needed, delete_file, upload, URLFile, processing_status
from ..database import r, _k
from ..objects import File
from ..network import get_ip

def _file_object(f):
    if not f.original:
        return {'error': 404}, 404

    ext = extension(f.original)

    ret = {
        'original': media_url(f.original),
        'type': get_mimetype(f.original),
        'files': [],
    }
    if f.compression:
        ret['compression'] = float(f.compression)
         
    ret['files'].append(_file_entry(f.original))

    if ext in processing_needed:
        for f_ext in processing_needed[ext]['formats']:
            ret['files'].append(_file_entry("%s.%s" % (f.hash, f_ext)))

    return ret

def _file_entry(f):
    return {
        'type': get_mimetype(f),
        'file': media_url(f),
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

    @route("/api/<id>")
    @route("/<id>.json")
    def get(self, id):
        f = File.from_hash(id) 

        if not f.original:
            return {'error': 404}, 404

        return _file_object(f)

    @route("/api/info")
    def info(self):
        if not "list" in request.args:
            return {'error': 400}, 400
        items = request.args['list'].split(',')

        res = {}
        for i in items:
            f = File.from_hash(i)
            
            if not f.original:
                res[i] = None
            else:
                res[i] = _file_object(f)
        
        return res

    @route("/api/<h>/delete")
    def delete(self, h):
        f = File.from_hash(h) 
        if not f.original:
            return {'error': 404}, 404
        if not check_password_hash(f.ip, get_ip()):
            return {'error': 401}, 401

        delete_file(f)
        return {'status': 'success'}


    @staticmethod
        

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
        f = File.from_hash(h)
        if not f.original: 
            return {'error': 404}, 404

        ret = {'status': processing_status(h)}
        if ret['status'] == 'done':
            ret[h] = _file_object(f)
            ret['hash'] = h

        return ret

    @route("/api/<h>/exists")
    def exists(self, h):
        f = File.from_hash(h)
        if not f.original:
            return {'exists': False}, 404

        return {'exists': True}
