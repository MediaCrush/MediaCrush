import unittest
import json

from .utils import TestMixin

class APITestCase(TestMixin):
    def _upload(self, f, ip='127.0.0.1'):
        return self.client.post('/api/upload/file', data={
            'file': (open('test_data/%s' % f), f)
        }, environ_base={'REMOTE_ADDR': ip})

    def test_bad_hash(self):
        response = self.client.get('/api/asdfasdfasdf')
        
        self.assertEqual(response.status_code, 404)
        self.assertEqual(json.loads(response.data), {u'error': 404})

    def test_cors(self):
        response = self.client.get('/api/asjfglsfdg', headers={
            'X-CORS-Status': 1
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn('x-status', json.loads(response.data))

    def test_upload_png(self):
        response = self._upload('cat.png')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data), {u'hash': u'HM-nQeR0oJ7p'})

    def test_upload_twice(self):
        self._upload('cat.png')
        response = self._upload('cat.png')

        self.assertEqual(response.status_code, 409)

    def test_upload_not_media(self):
        response = self._upload("not_media.dat")

        self.assertEqual(response.status_code, 415)

    def test_delete(self):
        h = json.loads(self._upload('cat.png').data)['hash']
        response = self.client.get('/api/%s/delete' % h, environ_base={
            'REMOTE_ADDR': '127.0.0.1'
        })

        self.assertEqual(response.status_code, 200)

    def test_delete_bad_ip(self):
        h = json.loads(self._upload('cat.png').data)['hash']
        response = self.client.get('/api/%s/delete' % h, environ_base={
            'REMOTE_ADDR': '127.0.0.2'
        })

        self.assertEqual(response.status_code, 401)

