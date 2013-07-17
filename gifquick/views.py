from flask.ext.classy import FlaskView, route
from flask import render_template, request, current_app, send_from_directory, url_for, abort, send_file
from werkzeug import secure_filename
from subprocess import call
import os
import json

from .config import _cfg
from .database import r, _k
from .ratelimit import rate_limit_exceeded, rate_limit_update
from .network import addressInNetwork, dottedQuadToNum, networkMask
from .files import *
from .decorators import json_output

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

class APIView(FlaskView):
    route_base = '/'

    @staticmethod
    def _file_entry(f):
        return {
            'type': get_mimetype(f),
            'file': media_url(f),
        }


    @route("/api/<id>.json")
    @route("/<id>.json")
    @json_output
    def get(self, id):
        f = r.get(_k("%s.file") % id)
        if not f:
            return {'error': 404}, 404

        ext = extension(f)

        ret = {
            'original': media_url(f),
            'files': [],
        }
       
        if ext in conversions_needed:
            for f_ext in conversions_needed[ext]['formats']:
                ret['files'].append(APIView._file_entry("%s.%s" % (id, f_ext)))

        ret['files'].append(APIView._file_entry(f))
        return ret

class QuickView(FlaskView):
    route_base = '/'

    def get(self, id):
        if ".." in id or id.startswith("/"):
            abort(403)

        if "." in id: 
            if os.path.exists(os.path.join(_cfg("storage_folder"), id)): # These requests are handled by nginx if it's set up
                path = os.path.join(_cfg("storage_folder"), id)
                return send_file(path, as_attachment=True)
    
        f = r.get(_k("%s.file") % id)
        ext = extension(f)
        return render_template(
            "view.html", 
            filename=id, 
            original=f, 
            video=ext in VIDEO_EXTENSIONS,
            controls=ext in CONTROLS_EXTENSIONS)

class HookView(FlaskView):
    def post(self):
        allow = False
        for ip in _cfg("hook_ips").split(","):
            parts = ip.split("/")
            range = 32
            if len(parts) != 1:
                range = int(parts[1])
            addr = networkMask(parts[0], range)
            if addressInNetwork(dottedQuadToNum(request.remote_addr), addr):
                allow = True
        if not allow:
            abort(403)
        # Pull and restart site
        event = json.loads(request.form["payload"])
        if any("[noupdate]" in c["message"] for c in event["commits"]):
            return "ignored"
        if "refs/heads/" + _cfg("hook_branch") == event["ref"]:
            call(["git", "pull"])
            call(_cfg("restart_command").split())
            return "thanks"
        return "ignored"
