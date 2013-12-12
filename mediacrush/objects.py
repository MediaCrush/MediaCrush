from mediacrush.database import r, _k
from mediacrush.celery import app

import hashlib
import uuid

import inspect

class RedisObject(object):
    hash = None

    def __init__(self, **kw):
        for k, v in kw.items():
            setattr(self, k, v)

        if "hash" not in kw:
            self.hash = hashlib.md5(uuid.uuid4().bytes).hexdigest()[:12]

    def __get_vars(self):
        if "__store__" in dir(self):
            d = {}
            for variable in set(self.__store__ + ['hash']): # Ensure we always store the hash
                d[variable] = getattr(self, variable)

            return d

        names = filter(lambda x: not x[0].startswith("_"), inspect.getmembers(self))
        names = filter(lambda x: not (inspect.isfunction(x[1]) or inspect.ismethod(x[1])), names)

        if "__exclude__" in dir(self):
            names = filter(lambda x: x[0] not in self.__exclude__, names)

        return dict(names)

    def __get_key(self):
        return self.__class__.get_key(self.hash)

    @classmethod
    def klass(cls, hash):
        for subclass in cls.__subclasses__():
            if r.sismember(_k(subclass.__name__.lower()), hash):
                return subclass
        return None

    @staticmethod
    def exists(hash):
        return RedisObject.klass(hash) is not None

    @classmethod
    def get_key(cls, hash):
        classname = cls.__name__
        return _k("%s.%s" % (classname.lower(), hash))

    @classmethod
    def from_hash(cls, hash):
        if cls == RedisObject:
            cls = RedisObject.klass(hash)

        if not cls:
            return None

        obj = r.hgetall(cls.get_key(hash))
        if not obj:
            return None

        obj['hash'] = hash

        return cls(**obj)

    @classmethod
    def get_all(cls):
        keys = r.keys(cls.get_key("*"))
        instances = []
        for key in keys:
            hash = key.rsplit(".")[2]
            instances.append(cls.from_hash(hash))

        return instances

    def save(self):
        key = _k(self.hash)
        obj = self.__get_vars()
        del obj['hash']

        r.hmset(self.__get_key() , obj)
        r.sadd(_k(self.__class__.__name__.lower()), self.hash) # Add to type-set

    def delete(self):
        r.srem(_k(self.__class__.__name__.lower()), self.hash)
        r.delete(self.__get_key())

class File(RedisObject):
    __store__ = ['original', 'mimetype', 'compression', 'reports', 'ip', 'taskid', 'processor']

    original = None
    mimetype = None
    compression = 0
    reports = 0
    ip = None
    taskid = None
    processor = None

    def add_report(self):
        self.reports = int(self.reports)
        self.reports += 1
        r.hincrby(File.get_key(self.hash), "reports", 1)

        if self.reports > 0:
            r.sadd(_k("reports-triggered"), self.hash)

    @property
    def status(self):
        if self.taskid == 'done':
            return 'done'

        result = app.AsyncResult(self.taskid)

        if result.status == 'FAILURE':
            if 'ProcessingException' in result.traceback:
                return 'error'
            if 'TimeoutException' in result.traceback:
                return 'timeout'

            return 'internal_error'

        status = {
            'PENDING': 'pending',
            'STARTED': 'processing',
            'SUCCESS': 'done',
        }.get(result.status, 'internal_error')

        if status == 'done':
            self.taskid = status
            self.save()

        return status

class Feedback(RedisObject):
    text = None
    useragent = None

class Album(RedisObject):
    _items = None
    ip = None
    __store__ = ['_items', 'ip'] # ORM override for __get_vars

    @property
    def items(self):
        files = []
        items = self._items.split(",")
        deleted = []

        for h in items:
            v = File.from_hash(h)
            if not v:
                deleted.append(h)
            else:
                files.append(v)

        if len(deleted):
            new_items = items
            if len(new_items) == 0:
                self.delete()
            else:
                self.items = items
                self.save()

        return files

    @items.setter
    def items(self, l):
        self._items = ','.join(l)

if __name__ == '__main__':
    a = RedisObject.from_hash("11fcf48f2c44")

    print a.items, type(a.items), a.hash
