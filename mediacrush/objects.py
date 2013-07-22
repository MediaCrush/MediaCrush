from .database import r, _k

import inspect

class RedisObject(object):
    hash = None

    def __init__(self, **kw):
        for k, v in kw.items():
            setattr(self, k, v)
   
    def __get_vars(self):
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
    ip = None

if __name__ == '__main__':
    a = File(hash="aasdf", compression=2)
    a.save()

    b = File.from_hash("aasdf")
    print vars(b)
