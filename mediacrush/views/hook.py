from flask.ext.classy import FlaskView, route
from flask import abort, request
import json
from subprocess import call

from ..config import _cfg
from ..network import *


class HookView(FlaskView):
    def post(self):
        print("Hook recieved")
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
            print("Hook ignored - not whitelisted IP")
            abort(403)
        print("Hook permitted")
        # Pull and restart site
        event = json.loads(request.form["payload"])
        if not _cfg("hook_repository") == "%s/%s" % (event["repository"]["owner"]["name"], event["repository"]["name"]):
            return "ignored"
        if any("[noupdate]" in c["message"] for c in event["commits"]):
            return "ignored"
        if "refs/heads/" + _cfg("hook_branch") == event["ref"]:
            print("Updating on hook")
            call(["git", "pull", "origin", "master"])
            call(_cfg("restart_command").split())
            return "thanks"
        return "ignored"
