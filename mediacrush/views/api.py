from flask.ext.classy import FlaskView, route
from flask import request

from ..decorators import json_output
from ..files import media_url, get_mimetype, extension, processing_needed
from ..database import r, _k
from ..objects import File

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
