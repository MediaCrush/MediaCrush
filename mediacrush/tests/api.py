import unittest
import json

from .utils import TestMixin

class APITestCase(TestMixin):
    def test_bad_hash(self):
        response = self.client.get('/api/asdfasdfasdf')
        
        assert response.status_code == 404
        assert json.loads(response.data) == {u'error': 404}

    def test_cors(self):
        response = self.client.get('/api/asjfglsfdg', headers={'X-CORS-Status': 1})

        assert response.status_code == 200
        assert 'x-status' in json.loads(response.data)

    def test_upload_png(self):
        response = self.client.post('/api/upload/file', data={
            'file': (open('test_data/cat.png'), 'cat.png')
        }, environ_base={'REMOTE_ADDR': '127.0.0.1'})

        assert response.status_code == 200
        assert json.loads(response.data) == {u'hash': u'HM-nQeR0oJ7p'}
