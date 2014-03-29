from flask.ext.classy import FlaskView, route
from flaskext.bcrypt import check_password_hash
from flask import send_file, render_template, abort, request, Response, g, redirect, current_app
import os
import json
import mimetypes

from mediacrush.files import extension, get_mimetype, delete_file
from mediacrush.ratelimit import rate_limit_exceeded, rate_limit_update
from mediacrush.fileutils import normalise_processor
from mediacrush.database import r, _k
from mediacrush.config import _cfg
from mediacrush.objects import File, Album, RedisObject
from mediacrush.network import get_ip
from mediacrush.tor import tor_redirect
from mediacrush.processing import get_processor
from mediacrush.views.api import objects

def fragment(processor):
    np = normalise_processor(processor)

    if np == 'video' and g.mobile:
        return 'mobilevideo'
    elif np == 'audio' and g.mobile:
        return 'mobileaudio'
    else:
        return np

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

    mimetype = f.mimetype
    processor = get_processor(f.processor)

    types = [mimetype]
    for f_ext in processor.outputs:
        types.append(get_mimetype(f_ext))

    if 'do-not-send' in request.cookies:
        try:
            blacklist = json.loads(request.cookies['do-not-send'])
            for t in blacklist:
                if t in types:
                    types.remove(t)
        except:
            pass
    metadata = {}
    if f.metadata and f.metadata != 'null':
        metadata = json.loads(f.metadata)
    subtitles = None
    if 'subtitles' in metadata and 'streams' in metadata['subtitles']:
        for stream in metadata['subtitles']['streams']:
            if stream['type'] == 'subtitle':
                subtitles = stream
                if subtitles['info']['codec_name'] == 'ssa':
                    subtitles['info']['codec_name'] = 'ass'
                subtitles['url'] = '/' + f.hash + '.' + subtitles['info']['codec_name']
                break

    return {
        'filename': f.hash,
        'original': f.original,
        'video': normalise_processor(f.processor) == 'video',
        'flags': f.flags.as_dict(),
        'metadata': metadata,
        'subtitles': subtitles,
        'has_subtitles': subtitles != None,
        'compression': compression,
        'mimetype': mimetype,
        'can_delete': can_delete if can_delete is not None else 'check',
        'fragment': 'fragments/' + fragment(f.processor) + '.html',
        'types': types,
        'processor': f.processor,
        'protocol': _cfg("protocol"),
        'domain': _cfg("domain"),
    }

def _album_params(album):
    items = album.items
    if not items:
        abort(404)
    files = objects[Album](album)['files']

    types = set([f.processor for f in items])
    filename = album.hash
    subtitles = False
    for f in items:
        metadata = {}
        if f.metadata and f.metadata != 'null':
            metadata = json.loads(f.metadata)
        if 'has_subtitles' in metadata:
            subtitles = metadata['has_subtitles']

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

    @route("/download/<path:file>")
    def download(self, file):
        return self._send_file(file)

    @route("/status/<id>")
    def status(self, id):
        klass = RedisObject.klass(id)
        if klass is not File:
            abort(404)

        f = File.from_hash(id)
        template_params = _template_params(f)

        if f.status in ['done', 'ready']:
            return tor_redirect('/' + f.hash)
        return render_template("status.html", **_template_params(f))

    @route("/<id>", defaults = {'layout': 'list'})
    @route("/<id>/<layout>")
    def get(self, id, layout):
        send = self._send_file(id)
        if send:
            return send

        klass = RedisObject.klass(id)
        if klass is Album:
            album = klass.from_hash(id)
            v = _album_params(album)
            v['layout'] = layout
            return render_template("albums/%s.html" % layout, **v)

        if klass is not File:
            abort(404)

        f = File.from_hash(id)
        return render_template("view.html", **_template_params(f))

    @route("/report/<id>", methods=['GET', 'POST'])
    def report(self, id):
        rate_limit_update(1, section="report")
        if not current_app.debug and rate_limit_exceeded(section="report"):
            return {'error': 413}, 413
        f = File.from_hash(id)
        f.add_report()
        return render_template("report.html")

    @route("/<id>/delete")
    def delete(self, id):
        return render_template("confirm_delete.html", h=id)

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

    @route("/<id>/fragment")
    def direct(self, id):
        klass = RedisObject.klass(id)
        if klass is not File:
            abort(404)

        f = File.from_hash(id)
        params = _template_params(f)
        params['album'] = True
        return render_template(params['fragment'], **params)

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
            v['filename'] = id
            return render_template("album-embedded.html", **v)

        if klass is not File:
            abort(404)

        f = File.from_hash(id)
        template_params = _template_params(f)
        template_params['embedded'] = True
        return render_template("direct.html", **template_params)
