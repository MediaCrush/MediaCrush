from gifquick.database import r, _k

if __name__ == '__main__':
    keys = r.keys(_k("*"))
    print "Deleting", len(keys), "keys"
    if keys:
        r.delete(*keys)

    print "Done."
