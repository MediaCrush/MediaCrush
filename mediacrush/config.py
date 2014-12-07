import logging
from mediacrush.network import is_tor
import os

from flask import request

try:
    from configparser import ConfigParser
except ImportError:
    # Python 2 support
    from ConfigParser import ConfigParser

logger = logging.getLogger("MediaCrush")
logger.setLevel(logging.DEBUG)

sh = logging.StreamHandler()
sh.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
sh.setFormatter(formatter)

logger.addHandler(sh)

# scss logger
logging.getLogger("scss").addHandler(sh)

config = ConfigParser()
config.readfp(open('config.ini'))
env = 'config'

_cfg = lambda k: config.get(env, k)
_cfgi = lambda k: int(_cfg(k))

# TODO: Move stuff below to paths.py

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
