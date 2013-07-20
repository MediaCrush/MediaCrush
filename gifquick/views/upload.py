from flask.ext.classy import FlaskView, route
from flask import request
import os

from ..database import r, _k

class UploadView(FlaskView):
    def post(self):
        f = request.files['file']
        return upload(f)
        
    def status(self, id):
        filename = id
        if not r.exists(_k("%s.lock" % filename)):
            if r.exists(_k("%s.error" % filename)):
                failure_type = r.get(_k("%s.error" % filename))
                r.delete(_k("%s.error") % filename)

                return failure_type

            return "done"
        return "processing"
