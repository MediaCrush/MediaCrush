from mediacrush.config import _cfgi
from mediacrush.objects import RedisObject, File
from mediacrush.celery import app, get_task_logger
from mediacrush.processing import processor_table
from mediacrush.fileutils import compression_rate

import time

logger = get_task_logger(__name__)

def _processing_needed(h, mimetype):
    klass = RedisObject.klass(h)

    if not klass:
        return False

    if klass is not File:
        return False

    if mimetype not in processor_table:
        return False

    return True

@app.task(track_started=True, bind=True)
def process_file(self, h, mimetype, sync):
    if not _processing_needed(h, mimetype):
        return

    f = File.from_hash(h)
    processor = processor_table[mimetype](f)

    processor.run(sync)

    if sync:
        f.compression = compression_rate(f.hash)
        f.save()
