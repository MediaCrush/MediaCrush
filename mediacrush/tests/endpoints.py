import unittest

from .utils import TestMixin

class EndpointTestCase(TestMixin):
    def test_version(self):
        self.assertIsNotNone(self.client.get('/version').data)
    
