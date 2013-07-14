from gifquick.worker import process_gif
from gifquick.database import r, _k

import time

if __name__ == '__main__':
    while True:
        while r.llen(_k("gifqueue")):
            job = r.lpop(_k("gifqueue")) 
            gif = job.rsplit(".")
            process_gif(gif)

            print "Processed", gif
       
        print "Sleeping" 
        time.sleep(1)
