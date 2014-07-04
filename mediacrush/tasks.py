from mediacrush.config import _cfgi
from mediacrush.objects import RedisObject, File, FailedFile, Album
from mediacrush.celery import app, get_task_logger, chord
from mediacrush.processing import processor_table, detect
from mediacrush.fileutils import compression_rate, delete_file, file_storage

import time
import os
import json

from subprocess import call

logger = get_task_logger(__name__)

@app.task
def zip_album(h):
    a = Album.from_hash(h)
    paths = map(lambda f: file_storage(f.original), a.items)
    zip_path = file_storage(h + ".zip")

    if os.path.exists(zip_path):
        return

    call(["zip", "-j", zip_path] + paths)

    a.metadata = json.dumps({"has_zip": True})
    a.save()

@app.task(bind=True, track_started=True)
def convert_file(self, h, path, p, metadata, processor_state, ignore_limit):
    f = File.from_hash(h)

    if p not in processor_table:
        p = 'default'

    processor = processor_table[p](path, f, processor_state, ignore_limit)

    # Execute the synchronous step.
    processor.sync()

    # Save compression information
    f = File.from_hash(h) # Reload file; user might have changed the config vector while processing
    f.compression = compression_rate(path, f)
    f.metadata = json.dumps(metadata)
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

    if f.status in ["internal_error", "error", "timeout", "unrecognised"]:
        failed = FailedFile(hash=h, status=f.status) # Create a "failed file" record
        failed.save()

        delete_file(f)

@app.task
def process_file(path, h, ignore_limit):
    f = File.from_hash(h)

    try:
        result = detect(path)
        processor = result['type'] if result else 'default'
    except:
        processor = 'default'
    finally:
        if processor == 'default': # Unrecognised file type
            failed = FailedFile(hash=h, status="unrecognised")
            failed.save()

            delete_file(f)
            return

    metadata = result['metadata'] if result else {}
    processor_state = result['processor_state'] if result else {}

    f.processor = processor

    setattr(f.flags, 'nsfw', False)
    if result and result['flags']:
        for flag, value in result['flags'].items():
            setattr(f.flags, flag, value)

    f.save()

    task = convert_file.s(h, path, processor, metadata, processor_state, ignore_limit)
    task_result = task.freeze() # This sets the taskid, so we can pass it to the UI

    # This chord will execute `syncstep` and `asyncstep`, and `cleanup` after both of them have finished.
    c = chord(task, cleanup.s(path, h))
    c.apply_async()

    f.taskid = task_result.id
    f.save()
