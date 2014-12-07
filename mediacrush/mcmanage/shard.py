from mediacrush.config import _cfgi, _cfg
import base64
import string
import os

digs = string.digits + string.letters + "-_"

# http://stackoverflow.com/posts/2267446/revisions
def int2base(x, base):
    if x < 0:
        sign = -1
    elif x == 0:
        return '0'
    else:
        sign = 1
        x *= sign
        digits = []
        while x:
            digits.append(digs[x % base])
            x /= base

        if sign < 0:
          digits.append('-')

        digits.reverse()
        return ''.join(digits)

def init(args):
    folder = _cfg("storage_folder")
    sharding_level = _cfgi("sharding")

    for i in range(64 ** sharding_level):
        try:
            os.mkdir(os.path.join(folder, int2base(i, 64)))
        except OSError, e:
            print(e)

def migrate(args):
    print("ho")
