import unittest
import json

from .utils import TestMixin

class APITestCase(TestMixin):
    def _post(self, url, data, ip='127.0.0.1'):
        return self.client.post(url, data=data, environ_base={'REMOTE_ADDR': ip})

    def _upload(self, f, ip='127.0.0.1'):
        return self._post('/api/upload/file', {
            'file': (open('test_data/%s' % f), f)
        }, ip=ip)

    def _create_album(self, files, ip='127.0.0.1'):
        return self._post('/api/album/create', {'list': ','.join(files)}, ip=ip)

    def _get_hash(self, f):
        return json.loads(self._upload(f).data)['hash']

class UtilsTestCase(APITestCase):
    def test_jsonp_callbacks(self):
        response = self.client.get('/api/dummy?callback=function123')

        self.assertTrue(response.data.startswith("function123({"))

    def test_bad_hash(self):
        response = self.client.get('/api/asdfasdfasdf')

        self.assertEqual(response.status_code, 404)
        self.assertEqual(json.loads(response.data), {'error': 404})

    def test_cors(self):
        response = self.client.get('/api/asjfglsfdg', headers={
            'X-CORS-Status': 1
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn('x-status', json.loads(response.data))

class AlbumTestCase(APITestCase):
    def test_create_album(self):
        h = [
           self._get_hash('cat.png'),
           self._get_hash('cat2.jpg')
        ]

        response = self._create_album(h)
        self.assertEqual(response.status_code, 200)
        self.assertIn("hash", json.loads(response.data))

    def test_album_content(self):
        h = [
           self._get_hash('cat.png'),
           self._get_hash('cat2.jpg')
        ]

        h = json.loads(self._create_album(h).data)["hash"]

        response = self.client.get("/api/%s" % h)
        files = json.loads(response.data)['files']
        hashes = [f['hash'] for f in files]

        self.assertEqual(response.status_code, 200)
        self.assertIn('3H3zGlUzzwF4', hashes)
        self.assertIn('HM-nQeR0oJ7p', hashes)

    def test_album_issue_422(self):
        h = [
           self._get_hash('cat.png'),
           self._get_hash('cat2.jpg')
        ]

        album = json.loads(self._create_album(h).data)["hash"]
        self.client.get('/api/%s/delete' % h[0], environ_base={
            'REMOTE_ADDR': '127.0.0.1'
        })

        response = self.client.get("/api/%s" % album)
        files = json.loads(response.data)['files']
        hashes = [f['hash'] for f in files]

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(hashes), 1)
        self.assertEqual(hashes[0], h[1])

    def test_album_empty(self):
        h = [
           self._get_hash('cat.png'),
        ]

        album = json.loads(self._create_album(h).data)["hash"]
        self.client.get('/api/%s/delete' % h[0], environ_base={
            'REMOTE_ADDR': '127.0.0.1'
        })

        response = self.client.get("/api/%s" % album)
        self.assertEqual(response.status_code, 404)

    def test_album_order(self):
        h = [
            self._get_hash('cat.png'),
            self._get_hash('cat2.jpg')
        ]

        album = json.loads(self._create_album(h).data)["hash"]

        response = self.client.get("/api/%s" % album)
        files = json.loads(response.data)['files']
        hashes = [f['hash'] for f in files]

        self.assertEqual(hashes[0], h[0])
        self.assertEqual(hashes[1], h[1])

    def test_create_album_bad_hash(self):
        h = [
            self._get_hash('cat.png'),
            'sdfgksgflg'
        ]

        response = self._create_album(h)
        self.assertEqual(response.status_code, 404)

    def test_create_album_containing_album(self):
        h = [
            self._get_hash('cat.png')
        ]

        response = self._create_album(h)
        h.append(json.loads(response.data)["hash"]) # Add the previous album's hash to the list

        response = self._create_album(h)
        self.assertEqual(response.status_code, 415)

    def test_create_album_51_files(self):
        cat = self._get_hash('cat.png')
        h = [cat for _ in range(51)]

        response = self._create_album(h)
        self.assertEqual(response.status_code, 413)

    def test_delete_album(self):
        h = [
            self._get_hash('cat.png'),
            self._get_hash('cat2.jpg')
        ]

        album = json.loads(self._create_album(h).data)["hash"]
        response = self.client.get('/api/%s/delete' % album, environ_base={
            'REMOTE_ADDR': '127.0.0.1'
        })
        self.assertEqual(response.status_code, 200)

        response = self.client.get('/%s' % album)
        self.assertEqual(response.status_code, 404)

class UploadTestCase(APITestCase):
    def test_upload_png(self):
        response = self._upload('cat.png')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data), {'hash': 'HM-nQeR0oJ7p'})

    def test_upload_twice(self):
        self._upload('cat.png')
        response = self._upload('cat.png')

        self.assertEqual(response.status_code, 409)

    def test_upload_not_media(self):
        response = self._upload("not_media.dat")

        self.assertEqual(response.status_code, 415)

class InfoTestCase(APITestCase):
    def test_list(self):
        h = [
           self._get_hash('cat.png'),
           self._get_hash('cat2.jpg')
        ]

        response = self.client.get('/api/info?list=' + ','.join(h))

        self.assertIn('3H3zGlUzzwF4', response.data)
        self.assertIn('HM-nQeR0oJ7p', response.data)

    def test_exists(self):
        h = self._get_hash('cat.png')
        response = self.client.get('/api/%s/exists' % h)

        self.assertEqual(json.loads(response.data), {'exists': True})

    def test_exists_bad_hash(self):
        response = self.client.get('/api/gfsdgf/exists')
        self.assertEqual(json.loads(response.data), {'exists': False})

class DeleteTestCase(APITestCase):
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
