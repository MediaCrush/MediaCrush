from flask.ext.classy import FlaskView, route
from flaskext.bcrypt import check_password_hash 
from flask import send_file, render_template, abort, request, Response
import os

from ..files import extension, VIDEO_EXTENSIONS, LOOP_EXTENSIONS, AUTOPLAY_EXTENSIONS, get_mimetype, delete_file
from ..database import r, _k
from ..config import _cfg
from ..objects import File
from ..network import get_ip

class ImageView(FlaskView):
    route_base = '/'

    @route("/download/<id>")
    def download(self, id):
        return self.get(id)

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

        can_delete = None
        if request.cookies.get('hist-opt-out', '0') == '1':
            can_delete = check_password_hash(f.ip, get_ip())

        ext = extension(f.original)
        mimetype = get_mimetype(f.original)

        template_params = {
            'filename': f.hash,
            'original': f.original,
            'video': ext in VIDEO_EXTENSIONS,
            'loop': ext in LOOP_EXTENSIONS,
            'autoplay': ext in AUTOPLAY_EXTENSIONS,
            'compression': compression,
            'mimetype': mimetype,
            'can_delete': can_delete if can_delete is not None else 'check'
        }

        return render_template("view.html", **template_params)

    def report(self, id):
        f = File.from_hash(id)
        f.add_report()
        return "ok"
    
    @route("/<h>/delete")
    def delete(self, h):
        f = File.from_hash(h)
        if not f.original:
            abort(404)

        if not check_password_hash(f.ip, get_ip()):
            abort(401)

        delete_file(f)
        return "ok"


    @route("/<h>/embed")
    def embed(self, h):
        text = render_template("embed.js", hash=filter(lambda c: unicode.isalnum(c) or c in ['-', '_'], h))
        return Response(text, mimetype="text/javascript") 
