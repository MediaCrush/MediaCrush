from mediacrush.processing import *
from mediacrush.config import logger
from mediacrush.objects import RedisObject

import time

def process_file(h):
    logger.info("Processing %s", h)
    klass = RedisObject.klass(h)

    logger.debug("Sleeping for 30 seconds... (%s)", h)
    time.sleep(30)
    logger.debug("Done. (%s)", h)

    if not klass:
        return

