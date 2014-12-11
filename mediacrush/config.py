import logging
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
