from .config import _cfg, _cfgi
from .database import r, _k

from flask import request


def rate_limit_exceeded():
    consumed = int(r.get(_k("rate_limit.%s") % request.remote_addr))
    if not consumed:
        return False

    return consumed >= _cfgi("bytes_per_hour")


def rate_limit_update(f):
    ip = request.remote_addr if "X-Real-IP" not in request.headers else request.headers.get("X-Real-IP")
    key = _k("rate_limit.%s" % ip)
    f.seek(0, 2)
    b = f.tell()
    f.seek(0)

    if not r.exists(key):
        r.setex(key, 3600, b)
    else:
        r.incrby(key, b)
