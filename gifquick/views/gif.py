from flask.ext.classy import FlaskView, route
from flask import request
import os

from ..files import *
from ..database import r, _k
from ..ratelimit import rate_limit_exceeded, rate_limit_update
from ..config import _cfg

class GifView(FlaskView):
    def post(self):
        gif = request.files['gif']

        if gif and allowed_file(gif.filename):
            rate_limit_update(gif)
            if rate_limit_exceeded():
                return "ratelimit", 400

            h = get_hash(gif)
            identifier = to_id(h)
            filename = "%s.%s" % (identifier, extension(gif.filename))
            path = os.path.join(_cfg("storage_folder"), filename)

            if os.path.exists(path):
                return identifier, 409

            gif.seek(0)  # Otherwise it'll write a 0-byte file
            gif.save(path)
    
            r.set(_k("%s.file") % identifier, filename)
            
            if extension(filename) in VIDEO_EXTENSIONS:
                r.lpush(_k("gifqueue"), identifier)  # Add this job to the queue
                r.set(_k("%s.lock" % identifier), "1")  # Add a processing lock

            return identifier 
        else:
            return "no", 415

    def status(self, id):
        filename = id
        if not r.exists(_k("%s.lock" % filename)):
            if r.exists(_k("%s.error" % filename)):
                failure_type = r.get(_k("%s.error" % filename))
                r.delete(_k("%s.error") % filename)

                return failure_type
            return "done"
        return "processing"
