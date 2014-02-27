import logging
from mediacrush.network import is_tor

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
domain_url = lambda path: "%s://%s/%s" % (_cfg("protocol"), _cfg("domain"), path)
cdn_url = lambda path: "%s/%s" % (_cfg("protocol") + "://" + _cfg("domain") if _cfg("cdn") == '' else _cfg("cdn"), path)

def domain_url(path):
    if is_tor():
        return "%s/%s" % (_cfg("tor_domain"), path)
    return "%s://%s/%s" % (_cfg("protocol"), _cfg("domain"), path)

def domain_url(path):
    if is_tor():
        return "%s/%s" % (_cfg("tor_domain"), path)
    return "%s/%s" % (_cfg("protocol") + "://" + _cfg("domain") if _cfg("cdn") == '' else _cfg("cdn"), path)
