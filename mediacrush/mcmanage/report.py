from ..database import r, _k
from ..config import _cfg
from ..objects import File, Feedback
from ..files import extension

from .compliments import compliments

from datetime import datetime
import os
import subprocess 
import random

TEMPLATE = """
This is the report for %s.

There are %d media blobs.

File usage:
%s

Disk info:
%s

Files with more than 10 reports:
%s

User feedback:
%s

%s"""

sizes = {}
extensions = {}

def report():
    d = os.walk(_cfg("storage_folder"))    
    for f in list(d)[0][2]: # Forgive me for this.
        size = os.path.getsize(os.path.join(_cfg("storage_folder"), f))
        size /= float(1 << 20) # log2(1048576) = 20
        size = round(size, 2)
        ext = extension(f)

        if ext not in extensions:
            extensions[ext] = 1
        else:
            extensions[ext] += 1

        if ext not in sizes:
            sizes[ext] = size
        else:
            sizes[ext] += size

    fileinfo = "" 
    for ext in extensions:
        fileinfo += "    -%d %ss (%0.2f MB)\n" % (extensions[ext], ext.upper(), sizes[ext])

    diskinfo = ''.join(["    %s\n" % s for s in subprocess.check_output(["df", "-kh"]).split("\n")])

    reports = r.smembers(_k("reports-triggered"))
    r.delete(_k("reports-triggered"))

    reportinfo = ""
    for report in reports:
        f = File.from_hash(report)
        reportinfo += "    https://mediacru.sh/%s (%s reports)\n" % (report, f.reports) 

    if len(reports) == 0:
        reportinfo += "    No reports today. Good job!"

    blobs = len(r.keys(_k("file.*")))

    feedback = Feedback.get_all()
    user_feedback = "" 
    for f in feedback:
        user_feedback += "    %s:\n        %s\n" % (f.useragent, f.text)
        f.delete()

    if not feedback:
        user_feedback += "    No fedback today!"

    report = TEMPLATE % (
        datetime.now().strftime("%d/%m/%Y"),
        blobs,
        fileinfo,
        diskinfo,
        reportinfo,
        user_feedback,

        random.choice(compliments)
    )


    return report 
