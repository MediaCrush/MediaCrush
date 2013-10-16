import unittest

from .utils import TestMixin

class EndpointTestCase(TestMixin):
    def test_version(self):
        assert self.client.get('/version').data 
    
