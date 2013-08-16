#!/usr/bin/env python

import os.path
from distutils.core import setup


CLASSIFIERS = [
    "Development Status :: 5 - Production/Stable",
    "Intended Audience :: End Users/Desktop",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python",
    "Topic :: Internet",
    "Topic :: Internet :: WWW/HTTP",
    "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
]

import mediacrush

setup(
    name = "mediacrush",
    packages = ["mediacrush", "mediacrush/mcmanage", "mediacrush/views"],
    scripts = ["mcmanage.py"],
    author = mediacrush.__author__,
    author_email = mediacrush.__email__,
    classifiers = CLASSIFIERS,
    description = "A media upload and hosting service",
    long_description = open(os.path.join(os.path.dirname(__file__), "README.md")).read(),
    download_url = "https://github.com/MediaCrush/MediaCrush/tarball/master",
    url = "https://github.com/MediaCrush/MediaCrush",
    version = mediacrush.__version__,
)
