from flask.ext.classy import FlaskView, route
from flask import render_template, request, current_app, send_from_directory, url_for
from werkzeug import secure_filename
import os
import hashlib

from .config import _cfg
from .database import r, _k

SERVER_STRING = "00"

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == "gif"

def get_hash(f):
    return hashlib.md5(f.read()).hexdigest()

class GifView(FlaskView):
    def post(self):
        gif = request.files['gif']
        quality = int(request.form['quality'])

        if quality < 1 or quality > 10:
            return "no", 400

        if gif and allowed_file(gif.filename):
            h = get_hash(gif)
            filename = "%s.gif" % h[:6] 

            path = os.path.join(_cfg("upload_folder"), filename)
            if os.path.isfile(path):
                if h == get_hash(open(path, "r")):
                    return "no", 409
                else:
                    filename = "%s.gif" % h[:7]

            gif.seek(0) # Otherwise it'll write a 0-byte file
            gif.save(path)
            filename = os.path.splitext(filename)[0]

            r.lpush(_k("gifqueue"), filename + "." + str(quality)) # Add this job to the queue

            return url_for('QuickView:get', id=SERVER_STRING + filename)
        else:
            return "no", 415
   
class QuickView(FlaskView):
    route_base = '/'

    def get(self, id):
        return render_template("view.html", filename=id[2:])

class RawView(FlaskView):
    @route("/<id>.ogv", endpoint="get_ogv")
    def ogv(self, id):
        print id
        return send_from_directory(_cfg("processed_folder"), id + ".ogv")

    @route("/<id>.mp4", endpoint="get_mp4") 
    def mp4(self, id):
        return send_from_directory(_cfg("processed_folder"), id + ".mp4") 

    @route("/<id>.gif", endpoint="get_gif") 
    def gif(self, id):
        return send_from_directory(_cfg("upload_folder"), id + ".gif") 
 
