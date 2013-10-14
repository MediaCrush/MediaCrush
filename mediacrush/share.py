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
        return getattr(self, method)(h)

    def link(self, h):
        return domain_url(h) 
    
    def directlink(self, h):
        original = _still_image(h)
        if original:
            return domain_url(original) 

        return self.link(h) + "/direct"

    def markdown(self, h):
        original = _still_image(h)
        if original:
            return "![](%s)" % domain_url(original)

        return "[MediaCrush](%s)" % domain_url(h)

    def html(self, h):
        original = _still_image(h)
        if original:
            return "<img src='%s'>" % domain_url(original)

        return "<a href='%s'>MediaCrush</a>" % domain_url(h)

    def bbcode(self, h):
        original = _still_image(h)
        if original:
            return "[img]%s[/img]" % domain_url(original)

        return "[url=%s]MediaCrush[/url]" % domain_url(h)

share = Share()
