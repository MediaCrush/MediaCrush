from flask.ext.classy import FlaskView, route
from flask import request
import os

from ..files import upload, URLFile, processing_status
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
        return processing_status(id)
