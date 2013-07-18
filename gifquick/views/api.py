from flask.ext.classy import FlaskView, route

from ..decorators import json_output
from ..files import media_url, get_mimetype, extension, conversions_needed
from ..database import r, _k

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
        f = r.get(_k("%s.file") % id)
        compression = r.get(_k("%s.compression") % id)

        if not f:
            return {'error': 404}, 404

        ext = extension(f)

        ret = {
            'original': media_url(f),
            'files': [],
        }
        if compression:
            ret['compression'] = float(compression)
             
        if ext in conversions_needed:
            for f_ext in conversions_needed[ext]['formats']:
                ret['files'].append(APIView._file_entry("%s.%s" % (id, f_ext)))

        ret['files'].append(APIView._file_entry(f))
        return ret
