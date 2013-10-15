from flask import jsonify, request
from functools import wraps
import json

def json_output(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        def jsonify_wrap(obj):
            callback = request.args.get('callback', False) 
            jsonification = jsonify(obj)
            if callback:
                jsonification.data = "%s(%s);" % (callback, jsonification.data) # Alter the response

            return jsonification

        result = f(*args, **kwargs)
        if isinstance(result, tuple):
            return jsonify_wrap(result[0]), result[1]
        return jsonify_wrap(result)

    return wrapper

def cors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        res = f(*args, **kwargs)
        if request.headers.get('x-cors-status', False):
            if isinstance(res, tuple):
                json_text = res[0].data
                code = res[1]
            else:
                json_text = res.data
                code = 200 

            o = json.loads(json_text)
            o['x-status'] = code 

            return jsonify(o)

        return res

    return wrapper


