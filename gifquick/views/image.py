from flask.ext.classy import FlaskView, route
from flask import send_file, render_template
import os

from ..files import extension, VIDEO_EXTENSIONS, CONTROLS_EXTENSIONS
from ..database import r, _k
from ..config import _cfg

class ImageView(FlaskView):
    route_base = '/'

    def get(self, id):
        if ".." in id or id.startswith("/"):
            abort(403)

        if "." in id: 
            if os.path.exists(os.path.join(_cfg("storage_folder"), id)): # These requests are handled by nginx if it's set up
                path = os.path.join(_cfg("storage_folder"), id)
                return send_file(path, as_attachment=True)
    
        f = r.get(_k("%s.file") % id)
        compression = r.get(_k("%s.compression") % id)
        if compression:
            compression = int(float(r.get(_k("%s.compression") % id)) * 100)

        ext = extension(f)
        return render_template(
            "view.html", 
            filename=id, 
            original=f, 
            video=ext in VIDEO_EXTENSIONS,
            controls=ext in CONTROLS_EXTENSIONS,
            compression=compression)
