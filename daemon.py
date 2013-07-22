from mediacrush.worker import process_gif
from mediacrush.database import r, _k

import time
import multiprocessing

if __name__ == '__main__':
    pool = multiprocessing.Pool()

    while True:
        while r.llen(_k("gifqueue")):
            job = r.lpop(_k("gifqueue"))
            pool.apply_async(process_gif, args=(job,))

        time.sleep(1)
