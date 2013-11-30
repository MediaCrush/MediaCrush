from mediacrush.database import r, _k
from mediacrush.config import logger
from mediacrush.worker import process_file

from multiprocessing import Pool, Process, Event
import sys, time

fetcher = None
pool = Pool()

def exit():
    logger.debug("exit(): waiting for workers to close...")

    pool.close()
    pool.join()
    sys.exit(0)

def exit_listener(ev):
    sub = r.pubsub()
    sub.subscribe(_k("restart"))

    logger.info("exit_listener: started")
    for m in sub.listen():
        try:
            data = m['data']
            if data == 'all':
                ev.set()
                return

        except:
            logger.debug("exit_listener: exc")

if __name__ == '__main__':
    logger.info("Daemon started")

    exit_ev = Event()
    listener = Process(target=exit_listener, args=(exit_ev,))
    listener.start()

    while True:
        if exit_ev.is_set():
            exit()

        key = r.brpoplpush(_k("tasks"), _k("tasks.running"))
        pool.apply_async(process_file, args=(key,))
