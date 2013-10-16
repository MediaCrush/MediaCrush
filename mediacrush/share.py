from .config import _cfg, domain_url
from .objects import File 
from .files import get_mimetype

def _still_image(h):
    f = File.from_hash(h)
    mimetype = get_mimetype(f.original)
    if mimetype.startswith("image") and mimetype != "image/gif":
        return f.original

    return None

class Share(object):
    def __call__(self, method, h):
        original = _still_image(h)
        if original:
            method += "_still"
            arg = original
        else:
            method += "_other"
            arg = h

        return getattr(self, method)(arg)

    def link_still(self, h):
        return domain_url(h) 

    link_other = link_still

    def directlink_still(self, h):
        return domain_url(h) 

    def directlink_other(self, h):
        return self.link_other(h) + "/direct"

    def markdown_still(self, h):
        return "![](%s)" % domain_url(h)

    def markdown_other(self, h):
        return "[MediaCrush](%s)" % domain_url(h)

    def html_still(self, h):
        return "<img src='%s'>" % domain_url(h)

    def html_other(self, h):
        return "<a href='%s'>MediaCrush</a>" % domain_url(h)

    def bbcode_still(self, h):
        return "[img]%s[/img]" % domain_url(h)

    def bbcode_other(self, h):
        return "[url=%s]MediaCrush[/url]" % domain_url(h)

share = Share()
