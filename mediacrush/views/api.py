from flask.ext.classy import FlaskView, route
from flaskext.bcrypt import check_password_hash 
from flask import request

from ..decorators import json_output
from ..files import media_url, get_mimetype, extension, processing_needed, delete_file, upload, URLFile, processing_status
from ..database import r, _k
from ..objects import File
from ..network import get_ip

class APIView(FlaskView):
    route_base = '/'

    @staticmethod
    def _file_entry(f):
        return {
            'type': get_mimetype(f),
            'file': media_url(f),
        }

    @staticmethod
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
             
        if ext in processing_needed:
            for f_ext in processing_needed[ext]['formats']:
                ret['files'].append(APIView._file_entry("%s.%s" % (f.hash, f_ext)))

        ret['files'].append(APIView._file_entry(f.original))
        return ret

    @route("/api/<id>")
    @route("/<id>.json")
    @json_output
    def get(self, id):
        f = File.from_hash(id) 

        if not f.original:
            return {'error': 404}, 404

        return APIView._file_object(f)

    @route("/api/info")
    @json_output
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
                res[i] = APIView._file_object(f)
        
        return res

    @route("/api/<h>/delete")
    @json_output
    def delete(self, h):
        f = File.from_hash(h) 
        if not f.original:
            return {'error': 404}, 404
        if not check_password_hash(f.ip, get_ip()):
            return {'error': 401}, 401

        delete_file(f)
        return {'status': 'success'}


    @staticmethod
    def _upload_f(f, filename):
        result = upload(f, filename)
        if not isinstance(result, tuple):
            return {'hash': result}
        else:
            info, status = result

            resp = {'error': status} 
            if status == 409:
                resp['hash'] = info
                resp[info] = APIView._file_object(File.from_hash(info)) 

            return resp, status
        

    @route("/api/upload/file", methods=['POST'])
    @json_output
    def upload_file(self):
        f = request.files['file']
       
        return APIView._upload_f(f, f.filename)

    @route("/api/upload/url", methods=['POST'])
    @json_output
    def upload_url(self):
        url = request.form['url']
        f = URLFile()

        try:
            f.download(url)
        except:
            return {'error': 400}, 400

        return APIView._upload_f(f, f.filename)

    @route("/api/<h>/status")
    @json_output
    def status(self, h):
        f = File.from_hash(h)
        if not f.original: 
            return {'error': 404}, 404

        return {'status': processing_status(h)}

    @route("/api/<h>/exists")
    @json_output
    def exists(self, h):
        f = File.from_hash(h)
        if not f.original:
            return {'exists': False}, 404

        return {'exists': True}
