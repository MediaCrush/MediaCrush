from flask.ext.classy import FlaskView, route
from flask import render_template, request, current_app, send_from_directory, url_for, abort, send_file
from werkzeug import secure_filename
import os
import hashlib

from .config import _cfg
from .database import r, _k
from .ratelimit import rate_limit_exceeded, rate_limit_update

EXTENSIONS = set(['gif', 'png', 'jpg', 'jpeg'])

extension = lambda f: f.rsplit('.', 1)[1].lower()

def allowed_file(filename):
    return '.' in filename and extension(filename) in EXTENSIONS

def get_hash(f):
    return hashlib.md5(f.read()).hexdigest()

class GifView(FlaskView):
    def post(self):
        gif = request.files['gif']

        if gif and allowed_file(gif.filename):
            rate_limit_update(gif)
            if rate_limit_exceeded():
                return "ratelimit", 400

            h = get_hash(gif)
            filename = "%s.%s" % (h[:10], extension(gif.filename))

            path = os.path.join(_cfg("upload_folder"), filename)
            if os.path.isfile(path):
                if h == get_hash(open(path, "r")):
                    return filename[:-4], 409
                else:
                    filename = "%s.%s" % (h[:7], extension(gif.filename))

            gif.seek(0) # Otherwise it'll write a 0-byte file
            gif.save(path)

            if extension(gif.filename) != "gif":
                return filename

            filename = os.path.splitext(filename)[0]

            r.lpush(_k("gifqueue"), filename) # Add this job to the queue
            r.set(_k("%s.lock" % filename), "1") # Add a processing lock

            return filename
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

    def get(self, id):
        if ".." in id or id.startswith("/"):
            abort(404)
        path = os.path.join(_cfg("upload_folder"), id + ".gif")
        return send_file(path, as_attachment=True)

class QuickView(FlaskView):
    route_base = '/'

    def get(self, id):
        if "." in id:
            return send_from_directory(_cfg("upload_folder"), id)

        return render_template("view.html", filename=id)

class RawView(FlaskView):
    @route("/<id>.ogv", endpoint="get_ogv")
    def ogv(self, id):
        return send_from_directory(_cfg("processed_folder"), id + ".ogv")

    @route("/<id>.mp4", endpoint="get_mp4") 
    def mp4(self, id):
        return send_from_directory(_cfg("processed_folder"), id + ".mp4") 

    @route("/<id>.gif", endpoint="get_gif") 
    def gif(self, id):
        if ".." in id or id.startswith("/"):
            abort(404)
        path = os.path.join(_cfg("upload_folder"), id + ".gif")
        return send_file(path, as_attachment=True)
