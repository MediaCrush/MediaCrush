from mediacrush.config import _cfgi
from mediacrush.objects import RedisObject, File
from mediacrush.celery import app, get_task_logger
from mediacrush.processing import processor_table, detect
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
def convert_file(self, h, path, p, sync):
    f = File.from_hash(h)
    if p not in processor_table:
        return

    processor = processor_table[p](path, f)

    if sync:
        processor.sync()
    else:
        processor.async()

    if sync:
        f.compression = compression_rate(path, f.hash)
        f.save()

@app.task
def process_file(path, h):
    f = File.from_hash(h)
    p = detect(path)

    result = convert_file.delay(h, path, p, True) # Synchronous step
    convert_file.delay(h, path, p, False) # Asynchronous step

    print result.id
    f.taskid = result.id
    f.save()
