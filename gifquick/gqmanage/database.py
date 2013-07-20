from ..database import r, _k

def database_clear(arguments):
    keys = r.keys(_k("*"))
    print "Deleting", len(keys), "keys"
    if keys:
        r.delete(*keys)

    print "Done."

def database_upgrade(arguments):
    """This function upgrades the old, key-based DB scheme to a hash-based one."""
    keys = r.keys(_k("*.file"))
    print keys
