from flask import Flask, render_template, request, g
from flaskext.bcrypt import Bcrypt
from flaskext.markdown import Markdown

from jinja2 import FileSystemLoader, ChoiceLoader
import os
import traceback

from mediacrush.views import HookView, APIView, MediaView, DocsView
from mediacrush.config import _cfg, _cfgi

app = Flask(__name__)
app.secret_key = _cfg("secret_key")
app.jinja_env.cache = None
bcrypt = Bcrypt(app)
Markdown(app)

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
        'adsense_slot': _cfg("adsense_slot")
    }

@app.route("/")
def index():
    opted_out = "ad-opt-out" in request.cookies
    return render_template("index.html", ads=not opted_out)

@app.route("/mine")
def mine():
    return render_template("mine.html")

@app.route("/demo")
def demo():
    return render_template("demo.html")

@app.route("/donate")
def donate():
    opted_out = "ad-opt-out" in request.cookies
    return render_template("donate.html", ads=not opted_out)

@app.route("/thanks")
def thanks():
    return render_template("thanks.html")

@app.route("/serious")
def serious():
    return render_template("serious.html")

DocsView.register(app)
APIView.register(app)
HookView.register(app)
MediaView.register(app)

if __name__ == '__main__':
    app.run(host=_cfg("debug-host"), port=_cfgi('debug-port'), debug=True)
