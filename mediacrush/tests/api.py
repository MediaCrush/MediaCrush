import unittest
import json

from .utils import TestMixin

class APITestCase(TestMixin):
    def _upload(self, f, ip='127.0.0.1'):
        return self.client.post('/api/upload/file', data={
            'file': (open('test_data/%s' % f), f)
        }, environ_base={'REMOTE_ADDR': ip})

    def _get_hash(self, f):
        return json.loads(self._upload(f).data)['hash']

    def test_jsonp_callbacks(self):
        response = self.client.get('/api/dummy?callback=function123')

        self.assertTrue(response.data.startswith("function123({"))

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
        h = self._get_hash('cat.png')
        response = self.client.get('/api/%s/delete' % h, environ_base={
            'REMOTE_ADDR': '127.0.0.1'
        })

        self.assertEqual(response.status_code, 200)

    def test_delete_bad_ip(self):
        h = self._get_hash('cat.png')
        response = self.client.get('/api/%s/delete' % h, environ_base={
            'REMOTE_ADDR': '127.0.0.2'
        })

        self.assertEqual(response.status_code, 401)

    def test_delete_bad_hash(self):
        response = self.client.get('/api/asdfasgdfs/delete')

        self.assertEqual(response.status_code, 404)

    def test_list(self):
        h = [
           self._get_hash('cat.png'),
           self._get_hash('cat2.jpg')
        ]

        response = self.client.get('/api/info?list=' + ','.join(h))

        self.assertIn(u'3H3zGlUzzwF4', response.data)
        self.assertIn(u'HM-nQeR0oJ7p', response.data)
