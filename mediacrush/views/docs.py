from flask.ext.classy import FlaskView
from flask import render_template, abort

from ..config import _cfg

import os

class DocsView(FlaskView):
    @staticmethod
    def _get_doc(id):
        docfile = id.lower()
        with open(os.path.join(_cfg("docs_path"), docfile + ".md")) as f:
            content = ''.join(f.readlines())
            return render_template("doc.html", content=content)


    def index(self):
        return DocsView._get_doc('index')

    def get(self, doc):
        try:
            return DocsView._get_doc(doc)
        except:
            abort(404)
