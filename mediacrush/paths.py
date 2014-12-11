import os
from flask import request
from mediacrush.config import _cfg, _cfgi
from mediacrush.network import is_tor

def domain_url(path):
    if is_tor():
        return "%s/%s" % (_cfg("tor_domain"), path)
    return "%s://%s/%s" % (_cfg("protocol"), _cfg("domain"), path)

def cdn_url(path):
    request_domain = request.headers["Host"].strip()
    path = shard(path)

    if request_domain != _cfg("incoming_domain").strip():
        return "/" + path
    else:
        return "%s/%s" % (_cfg("protocol") + "://" + _cfg("domain") if _cfg("cdn") == '' else _cfg("cdn"), path)

def shard(path):
    sharding_level = _cfgi("sharding")
    return os.path.join(path[:sharding_level], path)

def file_storage(f):
    return os.path.join(_cfg("storage_folder"), shard(f))
