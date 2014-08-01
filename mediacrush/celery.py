from __future__ import absolute_import

from mediacrush.config import _cfg

from celery import Celery, chord, signature
from celery.utils.log import get_task_logger

redis_connection = 'redis://%s:%s/1' % (_cfg("redis-ip"), _cfg("redis-port"))

app = Celery('proj',
     broker=redis_connection,
     backend=redis_connection,
     include=['mediacrush.tasks'])

# Optional configuration, see the application user guide.
app.conf.update(
    CELERY_ACCEPT_CONTENT = ['json'],
    CELERY_TASK_SERIALIZER='json',
    CELERY_RESULT_SERIALIZER='json',
    CELERY_CHORD_PROPAGATES=False,
    CELERY_ROUTES = {
        'mediacrush.tasks.process_file': {'queue': 'priority'}
    }
)

if __name__ == '__main__':
    app.start()
