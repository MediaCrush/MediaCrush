from .config import config
from .database import r, _k
from .network import get_ip

from flask import request


def rate_limit_exceeded(section="upload"):
    consumed = int(r.get(_k("rate_limit.%s.%s" % (section, get_ip()))))
    if not consumed:
        return False

    return consumed >= config.getint('ratelimit-%s' % section, 'units_per_period') 

def rate_limit_update(by, section="upload"):
    key = _k("rate_limit.%s.%s" % (section, get_ip()))

    if not r.exists(key):
        r.setex(key, config.get('ratelimit-%s' % section, 'period'), by)
    else:
        r.incrby(key, by)
