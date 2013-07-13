from flask.ext.classy import FlaskView, route
from flask import render_template, request, current_app, send_from_directory, url_for
from werkzeug import secure_filename
import os

from .config import _cfg

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == "gif"

class GifView(FlaskView):
    def post(self):
        gif = request.files['gif']
        if gif and allowed_file(gif.filename):
            # TODO: Make the filename a hash of the file
            filename = secure_filename(gif.filename)
            gif.save(os.path.join(_cfg("upload_folder"), filename))
            filename = os.path.splitext(filename)[0]

            return url_for('QuickView:get', id=filename)
        else:
            return "no", 415
   
class QuickView(FlaskView):
    def get(self, id):
        return render_template("view.html", filename=id)

class RawView(FlaskView):
    @route("/<id>.ogv", endpoint="get_ogv")
    def ogv(self, id):
        return send_from_directory(_cfg("processed_folder"), id + ".ogv")

    @route("/<id>.gif", endpoint="get_gif") 
    def gif(self, id):
        return send_from_directory(_cfg("upload_folder"), id + ".gif") 

