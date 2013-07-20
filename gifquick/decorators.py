from flask import jsonify, request
from functools import wraps

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
