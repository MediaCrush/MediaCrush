from mediacrush.config import _cfgi
from mediacrush.objects import RedisObject, File
from mediacrush.celery import app, get_task_logger, chord
from mediacrush.processing import processor_table, detect
from mediacrush.fileutils import compression_rate, delete_file

import time
import os

logger = get_task_logger(__name__)

@app.task(track_started=True)
def convert_file(h, path, p, extra, sync):
    f = File.from_hash(h)

    if p not in processor_table:
        p = 'default'

    processor = processor_table[p](path, f, extra)

    if sync:
        processor.sync()
    else:
        processor.async()

    if sync:
        f.compression = compression_rate(path, f)
        f.save()

@app.task
def cleanup(results, path, h):
    f = File.from_hash(h)
    os.unlink(path)

    if f.status != "done":
        delete_file(f)

@app.task
def process_file(path, h):
    f = File.from_hash(h)
    p, extra = detect(path)

    f.processor = p
    f.save()

    syncstep = convert_file.s(h, path, p, extra, True) # Synchronous step
    asyncstep = convert_file.s(h, path, p, extra, False) # Asynchronous step

    syncstep_result = syncstep.freeze() # This sets the taskid, so we can pass it to the UI

    # This chord will execute `syncstep` and `asyncstep`, and `cleanup` after both of them have finished.
    c = chord((syncstep, asyncstep), cleanup.s(path, h))
    c.apply_async()

    f.taskid = syncstep_result.id
    f.save()
