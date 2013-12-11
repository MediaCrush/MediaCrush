from mediacrush.config import _cfgi
from mediacrush.objects import RedisObject, File
from mediacrush.celery import app, get_task_logger, chord
from mediacrush.processing import processor_table, detect
from mediacrush.fileutils import compression_rate

import time
import os

logger = get_task_logger(__name__)

@app.task(track_started=True)
def convert_file(h, path, p, sync):
    f = File.from_hash(h)

    if p not in processor_table:
        p = 'default'

    processor = processor_table[p](path, f)

    if sync:
        processor.sync()
    else:
        processor.async()

    if sync:
        f.compression = compression_rate(path, f.hash)
        f.save()

@app.task
def cleanup(results, path):
    os.unlink(path)

@app.task(track_started=True)
def process_file(path, h):
    f = File.from_hash(h)
    p = detect(path)

    syncstep = convert_file.s(h, path, p, True) # Synchronous step
    asyncstep = convert_file.s(h, path, p, False) # Asynchronous step

    # This chord will execute `syncstep` and `asyncstep`, and `cleanup` after both of them have finished.
    c = chord((syncstep, asyncstep), cleanup.s(path))

    f.taskid = c.apply_async().id
    f.save()
