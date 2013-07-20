from flask.ext.classy import FlaskView, route

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


    @route("/api/<id>.json")
    @route("/<id>.json")
    @json_output
    def get(self, id):
        f = File.from_hash(id) 

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
                ret['files'].append(APIView._file_entry("%s.%s" % (id, f_ext)))

        ret['files'].append(APIView._file_entry(f.original))
        return ret
