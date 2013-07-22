import redis

from .config import _cfg, _cfgi

PREFIX = "mediacrush."
r = redis.StrictRedis(_cfg("redis-ip"), _cfgi("redis-port"))

_k = lambda x: PREFIX + x
