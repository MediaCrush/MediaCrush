from flask.ext.classy import FlaskView, route
from flaskext.bcrypt import check_password_hash
from flask import send_file, render_template, abort, request, Response, g
import os
import json
import mimetypes

from ..files import extension, VIDEO_FORMATS, LOOP_FORMATS, AUTOPLAY_FORMATS, get_mimetype, delete_file, processing_needed
from ..database import r, _k
from ..config import _cfg
from ..objects import File, Album, RedisObject
from ..network import get_ip

def fragment(mimetype):
    fragments = ['video', 'mobilevideo', 'image', 'audio']
    fragment_check = [
        mimetype == 'image/gif' or mimetype.startswith('video'),
        (mimetype.startswith('video') and g.mobile) or (mimetype == 'image/gif' and g.mobile),
        mimetype.startswith('image') and mimetype != 'image/gif',
        mimetype.startswith('audio'),
    ]

    for i, truth in enumerate(fragment_check):
        if truth:
            fragment = fragments[i]

    return fragment

def type_files(t):
    frag = fragment(t)
    require_files = ['video', 'audio']

    if frag in require_files:
        return render_template('fragments/%s_files.html' % frag)
    else:
        return ''

def _template_params(f):
    if f.compression:
        compression = int(float(f.compression) * 100)
    if compression == 100 or f.status != "done":
        compression = None

    can_delete = None
    try:
        if request.cookies.get('hist-opt-out', '0') == '1':
            can_delete = check_password_hash(f.ip, get_ip())
    except:
        pass

    mimetype = get_mimetype(f.original)

    types = [mimetype]
    for f_type in processing_needed[mimetype]['formats']:
        types.append(f_type)
    if 'do-not-send' in request.cookies:
        try:
            blacklist = json.loads(request.cookies['do-not-send'])
            for t in blacklist:
                if t in types:
                    types.remove(t)
        except:
            pass

    return {
        'filename': f.hash,
        'original': f.original,
        'video': mimetype in VIDEO_FORMATS,
        'loop': mimetype in LOOP_FORMATS,
        'autoplay': mimetype in AUTOPLAY_FORMATS,
        'compression': compression,
        'mimetype': mimetype,
        'can_delete': can_delete if can_delete is not None else 'check',
        'fragment': 'fragments/' + fragment(mimetype) + '.html',
        'types': types
    }

def _album_params(album):
    items = album.items
    if not items:
        abort(404)

    types = set([get_mimetype(f.original) for f in items])

    can_delete = None
    try:
        if request.cookies.get('hist-opt-out', '0') == '1':
            can_delete = check_password_hash(f.ip, get_ip())
    except:
        pass

    return vars()

def render_media(f, album=False):
    params = _template_params(f)
    params['album'] = album
    return render_template(params['fragment'], **params)

class MediaView(FlaskView):
    route_base = '/'

    def _send_file(self, id):
        if ".." in id or id.startswith("/"):
            abort(403)

        if "." in id:
            if os.path.exists(os.path.join(_cfg("storage_folder"), id)): # These requests are handled by nginx if it's set up
                path = os.path.join(_cfg("storage_folder"), id)
                return send_file(path, as_attachment=True)

    @route("/<id>/download")
    def download(self, id):
        f = File.from_hash(id)
        if os.path.exists(os.path.join(_cfg("storage_folder"), f.original)):
           path = os.path.join(_cfg("storage_folder"), f.original)
           return send_file(path, as_attachment=True)
        return self.get(id)

    def get(self, id):
        send = self._send_file(id)
        if send:
            return send

        klass = RedisObject.klass(id)
        if klass is Album:
            album = klass.from_hash(id)
            v = _album_params(album)
            return render_template("album.html", **v)

        if klass is not File:
            abort(404)

        f = File.from_hash(id)
        return render_template("view.html", **_template_params(f))

    def report(self, id):
        f = File.from_hash(id)
        f.add_report()
        return "ok"

    @route("/<id>/direct")
    def direct(self, id):
        send = self._send_file(id)
        if send:
            return send

        klass = RedisObject.klass(id)
        if klass is Album:
            album = klass.from_hash(id)
            v = _album_params(album)
            return render_template("album.html", **v)

        if klass is not File:
            abort(404)

        f = File.from_hash(id)
        template_params = _template_params(f)
        return render_template("direct.html", **template_params)

    @route("/<id>/frame")
    def frame(self, id):
        send = self._send_file(id)
        if send:
            return send

        klass = RedisObject.klass(id)
        if klass is Album:
            album = klass.from_hash(id)
            v = _album_params(album)
            v['embedded'] = True
            return render_template("album-embedded.html", **v)

        if klass is not File:
            abort(404)

        f = File.from_hash(id)
        template_params = _template_params(f)
        template_params['embedded'] = True
        return render_template("direct.html", **template_params)
