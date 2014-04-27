from flask.ext.classy import FlaskView, route
from flask import redirect

from mediacrush.views.api.v1 import APIv1
from mediacrush.views.api.v2 import APIv2

versions = [APIv1, APIv2]

class APIView(FlaskView):
    route_base = '/'

    @staticmethod
    def _route_base(i):
        route_base = '/api'
        if i > 0:
            route_base += '/v' + str(i + 1)

        return route_base

    @classmethod
    def register(cls, *args, **kwargs):
        for i, api in enumerate(versions):
            # Assign the correct route base
            api.route_base = APIView._route_base(i)

            # Register it with the app
            api.register(*args, **kwargs)

        # Register ourselves
        super(APIView, cls).register(*args, **kwargs)

    @route("/<hash>.json")
    def toplevel_get(self, hash):
        # TODO(question): should /hash.json redirect to the first API or the current one?
        return redirect(APIView._route_base(0) + "/" + hash)
