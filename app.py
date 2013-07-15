from flask import Flask, render_template, request, g
from gifquick.views import GifView, QuickView, RawView
from gifquick.config import _cfg

app = Flask(__name__)
app.secret_key = _cfg("secret_key")


@app.before_request
def find_dnt():
    field = "Dnt"
    do_not_track = False
    if field in request.headers:
        do_not_track = True if request.headers[field] == "1" else False

    g.do_not_track = do_not_track


@app.context_processor
def analytics():
    return {
        'analytics_id': _cfg("google_analytics_id"),
        'analytics_domain': _cfg("google_analytics_domain"),
    }


@app.route("/")
def index():
    opted_out = "ad-opt-out" in request.cookies
    return render_template("index.html", ads=not opted_out)


@app.route("/demo")
def demo():
    return render_template("demo.html")

GifView.register(app)
QuickView.register(app)
RawView.register(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
