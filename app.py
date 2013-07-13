from flask import Flask, render_template
from gifquick.views import GifView, QuickView, RawView

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

GifView.register(app)
QuickView.register(app)
RawView.register(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
