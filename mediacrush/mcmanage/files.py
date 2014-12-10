from ..objects import File, Album, Feedback, RedisObject, FailedFile
from ..files import delete_file

def files_delete(arguments):
    hash = arguments['<hash>']
    if hash.startswith("./"):
        hash = hash[2:]

    f = File.from_hash(hash)
    if not f:
        print("%r is not a valid file." % hash)
        return
    delete_file(f)
    print("Done, thank you.")

def files_nsfw(arguments):
    hash = arguments['<hash>']

    klass = RedisObject.klass(hash)
    f = File.from_hash(hash)
    o = klass.from_hash(hash)
    if not f:
        print("%r is not a valid file." % arguments["<hash>"])
        return
    setattr(o.flags, 'nsfw', True)
    o.save()
    print("Done, thank you.")
