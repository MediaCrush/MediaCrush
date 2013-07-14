from gifquick.worker import process_gif
from gifquick.database import r, _k

import time

if __name__ == '__main__':
    while True:
        while r.llen(_k("gifqueue")):
            job = r.lpop(_k("gifqueue")) 
            process_gif(job)

            print "Processed", job
       
        print "Sleeping" 
        time.sleep(1)
