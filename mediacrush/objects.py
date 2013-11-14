from .database import r, _k
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
        return dict(names)

    def __get_key(self):
        return self.__class__.get_key(self.hash)

    @classmethod
    def get_key(cls, hash):
        classname = cls.__name__
        return _k("%s.%s" % (classname.lower(), hash))

    @classmethod
    def from_hash(cls, hash):
        obj = r.hgetall(cls.get_key(hash))
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

    def delete(self):
        r.delete(self.__get_key())


class File(RedisObject):
    original = None
    compression = 0
    reports = 0
    ip = None

    def add_report(self):
        self.reports = int(self.reports)
        self.reports += 1
        r.hincrby(File.get_key(self.hash), "reports", 1)

        if self.reports > 0:
            r.sadd(_k("reports-triggered"), self.hash)

class Feedback(RedisObject):
    text = None
    useragent = None

class Album(RedisObject):
    _items = None
    __store__ = ['_items'] # ORM override for __get_vars

    @property
    def items(self):
        return self._items.split(",")

    @items.setter
    def items(self, l):
        self._items = ','.join(l)

if __name__ == '__main__':
    a = Album()

    a.items = ['a', 'b', 'c']
    a.save()
    print a.items, type(a.items), a.hash
