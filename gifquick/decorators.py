from flask import jsonify
from functools import wraps

def json_output(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        result = f(*args, **kwargs)
        if isinstance(result, tuple):
            return jsonify(result[0]), result[1]
        return jsonify(result)


    return wrapper
