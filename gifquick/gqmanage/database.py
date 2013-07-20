from ..database import r, _k
from ..objects import File
from ..files import compression_rate

def database_clear(arguments):
    keys = r.keys(_k("*"))
    print "Deleting", len(keys), "keys"
    if keys:
        r.delete(*keys)

    print "Done."

def database_upgrade(arguments):
    """This function upgrades the old, key-based DB scheme to a hash-based one."""
    keys = r.keys(_k("*.file"))

    for key in keys:
        hash = key.split(".")[1]
        f = File(hash=hash)
        f.original = r.get(key)
        f.save()
        try:
            f.compression = compression_rate(hash)
            f.save()
        except:
            pass # The compression rate does not apply in some cases
        r.delete(key)
