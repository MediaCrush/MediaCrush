from flask.ext.classy import FlaskView, route
from flask import request
import os

from ..files import upload, URLFile
from ..objects import File
from ..database import r, _k

class UploadView(FlaskView):
    def post(self):
        if 'url' in request.form:
            url = request.form['url']
            f = URLFile()
            try:
                f.download(url)
            except:
                return "bad_url", 400
        else:
            f = request.files['file']

        filename = f.filename
        return upload(f, filename)

    def exists(self, id):
        f = File.from_hash(id)
        if not f.original:
            return "false"
        return "true"
        
    def status(self, id):
        filename = id
        if not r.exists(_k("%s.lock" % filename)):
            if r.exists(_k("%s.error" % filename)):
                failure_type = r.get(_k("%s.error" % filename))
                r.delete(_k("%s.error") % filename)

                return failure_type

            return "done"
        return "processing"
