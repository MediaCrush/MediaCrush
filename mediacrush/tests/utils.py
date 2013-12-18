import unittest
import shutil
import os
import time

from ..app import app
from ..config import _cfg
from ..mcmanage.database import database_clear

def clear_env():
    database_clear({'silent': True})
    shutil.rmtree(_cfg("storage_folder"))
    os.mkdir(_cfg("storage_folder"))

class TestMixin(unittest.TestCase):
    def setUp(self):
        clear_env()
        app.config['TESTING'] = True
        self.client = app.test_client()
