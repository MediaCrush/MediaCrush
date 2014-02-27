import json
from flask import request
from flaskext.bcrypt import generate_password_hash


get_ip = lambda: request.remote_addr if "X-Real-IP" not in request.headers else request.headers.get("X-Real-IP")

def makeMask(n):
    "return a mask of n bits as a long integer"
    return (2 << n - 1) - 1


def dottedQuadToNum(ip):
    "convert decimal dotted quad string to long integer"
    parts = ip.split(".")
    return int(parts[0]) | (int(parts[1]) << 8) | (int(parts[2]) << 16) | (int(parts[3]) << 24)


def networkMask(ip, bits):
    "Convert a network address to a long integer"
    return dottedQuadToNum(ip) & makeMask(bits)


def addressInNetwork(ip, net):
    "Is an address in a network"
    return ip & net == net

def secure_ip():
    ip = get_ip()
    if ip == '127.0.0.1':
        return 'anonymous_user'
    return generate_password_hash(ip)

