from flask import Flask, render_template, request, g, Response, redirect
from flaskext.bcrypt import Bcrypt
from flaskext.markdown import Markdown

from jinja2 import FileSystemLoader, ChoiceLoader
from shutil import copyfile, rmtree
import scss
import os
import traceback
import subprocess

from mediacrush.views import HookView, APIView, MediaView, DocsView
from mediacrush.config import _cfg, _cfgi
from mediacrush.files import extension
from mediacrush.views.media import render_media, type_files
from mediacrush.share import share

app = Flask(__name__)
app.jinja_env.cache = None
bcrypt = Bcrypt(app)
Markdown(app)
scss.config.LOAD_PATHS = [
    './styles/'
];

notice_enabled = False
notice_text = "We're currently experiencing some problems with user history and the API"

def prepare():
    if os.path.exists(app.static_folder):
        rmtree(app.static_folder)
    os.makedirs(app.static_folder)
    compiler = scss.Scss(scss_opts = {
        'style': 'compressed'
    })

    # Compile styles (scss)
    d = os.walk('styles')
    for f in list(d)[0][2]:
        if extension(f) == "scss":
            with open(os.path.join('styles', f)) as r:
                output = compiler.compile(r.read())

            parts = f.rsplit('.')
            css = '.'.join(parts[:-1]) + ".css"

            with open(os.path.join(app.static_folder, css), "w") as w:
                w.write(output)
                w.flush()

    copy = ['images', 'scripts']
    # Simple copy for the rest of the files
    for folder in copy:
        for f in list(os.walk(folder))[0][2]:
            copyfile(os.path.join(folder, f), os.path.join(app.static_folder, os.path.basename(f)))

@app.before_first_request
def compile_first():
    prepare()

@app.before_request
def compile_if_debug():
    if app.debug:
        prepare()

@app.before_request
def find_dnt():
    field = "Dnt"
    do_not_track = False
    if field in request.headers:
        do_not_track = True if request.headers[field] == "1" else False

    g.do_not_track = do_not_track

@app.before_request
def jinja_template_loader():
    mobile = request.user_agent.platform in ['android', 'iphone', 'ipad']
    g.mobile = mobile
    if mobile:
        app.jinja_loader = ChoiceLoader([
            FileSystemLoader(os.path.join("templates", "mobile")),
            FileSystemLoader("templates"),
        ])
    else:
        app.jinja_loader = FileSystemLoader("templates")

@app.errorhandler(404)
def not_found(e):
    return render_template("error.html", error="File not found."), 404

@app.errorhandler(Exception)
def exception_catch_all(e):
    traceback.print_exc()
    return render_template("error.html", error=repr(e)), 500

@app.context_processor
def inject():
    return {
        'mobile': g.mobile,
        'analytics_id': _cfg("google_analytics_id"),
        'analytics_domain': _cfg("google_analytics_domain"),
        'dwolla_id': _cfg("dwolla_id"),
        'coinbase_id': _cfg("coinbase_id"),
        'flattr_id': _cfg("flattr_id"),
        'adsense_client': _cfg("adsense_client"),
        'adsense_slot': _cfg("adsense_slot"),
        'dark_theme': "dark_theme" in request.cookies,
        'ads': not "ad-opt-out" in request.cookies,
        'notice_text': notice_text,
        'notice_enabled': notice_enabled,
        'share': share,
        'render_media': render_media,
        'type_files': type_files
    }

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/mine")
def mine():
    return render_template("mine.html")

@app.route("/apps")
def apps():
    return render_template("apps.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route('/demo')
def demo():
    return redirect('/about', code=301)

@app.route("/donate")
def donate():
    opted_out = "ad-opt-out" in request.cookies
    return render_template("donate.html", ads=not opted_out)

@app.route("/thanks")
def thanks():
    return render_template("thanks.html")

@app.route("/version")
def version():
    v = subprocess.check_output(["git", "log", "-1"])
    return Response(v, mimetype="text/plain")

@app.route("/serious")
def serious():
    return render_template("serious.html")

@app.route("/troubleshooting")
def troubleshooting():
    return render_template("troubleshooting.html")

@app.route("/mediacrush.js")
def mediacrushjs():
    v = render_template("mediacrush.js", host=_cfg("domain"))
    return Response(v, mimetype="application/javascript")

DocsView.register(app)
APIView.register(app)
HookView.register(app)
MediaView.register(app)

if __name__ == '__main__':
    app.run(host=_cfg("debug-host"), port=_cfgi('debug-port'), debug=True)
