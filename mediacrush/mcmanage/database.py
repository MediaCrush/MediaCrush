from ..database import r, _k
from ..objects import File, RedisObject

def database_clear(arguments):
    keys = r.keys(_k("*"))
    if not arguments.get('silent', False):
        print("Deleting %i keys" % (len(keys)))

    if keys:
        r.delete(*keys)

    if not arguments.get('silent', False):
        print("Done.")

def database_sync(arguments):
    keys = r.keys(_k("*"))

    print("Synchronising objects to type-sets...")
    for key in keys:
        parts = key.split(".")
        if len(parts) != 3: # Only interested in keys with three parts (objects).
            continue

        if parts[2] in ["lock", "error"]:
            continue

        r.sadd(_k(parts[1]), parts[2])

    print("Done.")
