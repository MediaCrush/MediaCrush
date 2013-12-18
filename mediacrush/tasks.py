from mediacrush.config import _cfgi
from mediacrush.objects import RedisObject, File
from mediacrush.celery import app, get_task_logger, chord
from mediacrush.processing import processor_table, detect
from mediacrush.fileutils import compression_rate, delete_file

import time
import os

logger = get_task_logger(__name__)

@app.task(bind=True, track_started=True)
def convert_file(self, h, path, p, extra):
    f = File.from_hash(h)

    if p not in processor_table:
        p = 'default'

    processor = processor_table[p](path, f, extra)

    # Execute the synchronous step.
    processor.sync()

    # Save compression information
    f.compression = compression_rate(path, f)
    f.save()

    # Notify frontend: sync step is done.
    self.update_state(state="READY")

    # Execute the asynchronous step.
    processor.important = False
    processor.async()

@app.task
def cleanup(results, path, h):
    f = File.from_hash(h)
    os.unlink(path)

    if f.status in ["internal_error", "error", "timeout"]:
        delete_file(f)

@app.task
def process_file(path, h):
    f = File.from_hash(h)
    p, extra = detect(path)

    f.processor = p
    f.save()

    task = convert_file.s(h, path, p, extra)
    task_result = task.freeze() # This sets the taskid, so we can pass it to the UI

    # This chord will execute `syncstep` and `asyncstep`, and `cleanup` after both of them have finished.
    c = task | cleanup.s(path, h)
    c.apply_async()

    f.taskid = task_result.id
    f.save()
