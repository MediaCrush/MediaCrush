import logging
from ConfigParser import ConfigParser

logger = logging.getLogger("MediaCrush")
logger.setLevel(logging.DEBUG)

sh = logging.StreamHandler()
sh.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
sh.setFormatter(formatter)

logger.addHandler(sh)

config = ConfigParser()
config.readfp(open('config.ini'))
env = config.get('meta', 'environment')

_cfg = lambda k: config.get(env, k)
_cfgi = lambda k: int(_cfg(k))
domain_url = lambda path: "%s://%s/%s" % (_cfg("protocol"), _cfg("domain"), path)
