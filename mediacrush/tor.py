from flask import request, current_app, redirect
from mediacrush.config import _cfg
from mediacrush.network import is_tor

def tor_redirect(path):
    if is_tor():
        return redirect(_cfg("tor_domain") + '/' + path)
    return redirect(path)
