from flask import Flask, render_template, request
from gifquick.views import GifView, QuickView, RawView
from gifquick.config import _cfg

app = Flask(__name__)
app.secret_key = _cfg("secret_key")

@app.route("/")
def index():
    opted_out = "ad-opt-out" in request.cookies
    return render_template("index.html", ads=not opted_out)

GifView.register(app)
QuickView.register(app)
RawView.register(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
