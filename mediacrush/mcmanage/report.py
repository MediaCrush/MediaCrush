from ..database import r, _k
from ..config import _cfg
from ..objects import File, Feedback
from ..files import extension
from ..processing import get_processor

from .compliments import compliments

from datetime import datetime
import os
import subprocess
import random

TEMPLATE = """
This is the report for %s.

There are %d media blobs, and %d albums.

File usage:
%s

Disk info:
%s

Reported files:
%s

User feedback:
%s

%s"""

sizes = {}
types = {}

def report():
    files = File.get_all()
    for f in files:
        try:
            if not 'original' in f:
                continue
            if f.original == None:
                continue # This is something we should think about cleaning up after at some point
            try:
                with open(os.path.join(_cfg("storage_folder"), f.original)):
                    size = os.path.getsize(os.path.join(_cfg("storage_folder"), f.original))
            except IOError: pass
            processor = get_processor(f._processor)
            for f_ext in processor.outputs:
                name = "%s.%s" % (f.hash, f_ext)
                if name == f.original:
                    continue
                try:
                    with open(os.path.join(_cfg("storage_folder"), name)):
                        size += os.path.getsize(os.path.join(_cfg("storage_folder"), name))
                except IOError: pass
            for f_ext in processor.extras:
                try:
                    with open(os.path.join(_cfg("storage_folder"), "%s.%s" % (f.hash, f_ext))):
                        size += os.path.getsize(os.path.join(_cfg("storage_folder"), "%s.%s" % (f.hash, f_ext)))
                except IOError: pass
            size /= float(1 << 20)
            size = round(size, 2)

            if f._processor not in types:
                types[f._processor] = 1
            else:
                types[f._processor] += 1

            if f._processor not in sizes:
                sizes[f._processor] = size
            else:
                sizes[f._processor] += size
        except:
            pass

    fileinfo = ""
    for t in types:
        fileinfo += "    -%d %s blobs (%0.2f MB)\n" % (types[t], t, sizes[t])

    diskinfo = ''.join(["    %s\n" % s for s in subprocess.check_output(["df", "-kh"]).split("\n")])

    reports = r.smembers(_k("reports-triggered"))
    r.delete(_k("reports-triggered"))

    reportinfo = ""
    for report in reports:
        try:
            f = File.from_hash(report)
            reportinfo += "    https://mediacru.sh/%s (%s reports)\n" % (report, f.reports)
        except:
            pass

    if len(reports) == 0:
        reportinfo += "    No reports today. Good job!"

    blobs = len(r.keys(_k("file.*")))
    albums = len(r.keys(_k("album.*")))

    feedback = Feedback.get_all()
    user_feedback = ""
    for f in feedback:
        user_feedback += "    %s:\n        %s\n" % (f.useragent, f.text)
        f.delete()

    if not feedback:
        user_feedback += "    No feedback today!"

    report = TEMPLATE % (
        datetime.now().strftime("%d/%m/%Y"),
        blobs,
        albums,
        fileinfo,
        diskinfo,
        reportinfo,
        user_feedback,
        random.choice(compliments)
    )


    return report
