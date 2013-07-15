import json

def makeMask(n):
    "return a mask of n bits as a long integer"
    return (2L << n - 1) - 1


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
