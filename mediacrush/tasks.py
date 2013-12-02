from mediacrush.processing import *
from mediacrush.config import _cfgi
from mediacrush.objects import RedisObject, File
from mediacrush.celery import app, get_task_logger
from mediacrush.processing import processor_table

import time

logger = get_task_logger(__name__)

@app.task(track_started=True)
def process_file(h, mimetype):
    logger.info("Processing %s", h)
    klass = RedisObject.klass(h)

    if not klass:
        return

    if klass is not File:
        return

    if mimetype not in processor_table:
        return

    f = File.from_hash(h)
    processor = processor_table[mimetype](f)
    processor.execute()
