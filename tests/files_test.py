from mediacrush.files import get_mimetype

import unittest

class FilesTestCase(unittest.TestCase):
    def test_get_mimetype(self):
        self.assertEqual(get_mimetype("blah.mp4"), "video/mp4")
