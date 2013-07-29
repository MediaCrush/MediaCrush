from flask.ext.classy import FlaskView, route
from flask import send_file, render_template, abort, request
import os

from ..files import extension, VIDEO_EXTENSIONS, CONTROLS_EXTENSIONS, get_mimetype
from ..database import r, _k
from ..config import _cfg
from ..objects import File

class ImageView(FlaskView):
    route_base = '/'

    def get(self, id):
        if ".." in id or id.startswith("/"):
            abort(403)

        if "." in id: 
            if os.path.exists(os.path.join(_cfg("storage_folder"), id)): # These requests are handled by nginx if it's set up
                path = os.path.join(_cfg("storage_folder"), id)
                return send_file(path, as_attachment=True)
    
        f = File.from_hash(id) 
        if not f.original:
            abort(404)

        if f.compression:
            compression = int(float(f.compression) * 100)

        ext = extension(f.original)
        mimetype = get_mimetype(f.original)
        return render_template(
            "view.html", 
            filename=id, 
            original=f.original, 
            video=ext in VIDEO_EXTENSIONS,
            controls=ext in CONTROLS_EXTENSIONS,
            compression=compression,
            mimetype=mimetype)

    def report(self, id):
        f = File.from_hash(id)
        f.add_report()
        return "ok"
