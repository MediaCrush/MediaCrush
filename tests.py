from mediacrush.tests import *
from mediacrush.config import config
import unittest

if __name__ == '__main__':
    if config.get('meta', 'environment') != 'dev':
        print("Do NOT run unit tests in production! It will wipe the database.")
    else:
        unittest.main()
