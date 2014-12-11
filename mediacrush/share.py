from mediacrush.config import _cfg
from mediacrush.paths import domain_url, cdn_url, shard
from mediacrush.objects import File
from mediacrush.network import is_tor

def _still_image(h):
    f = File.from_hash(h)
    if f.processor.startswith("image"):
        return f.original

    return None

class Share(object):
    def __call__(self, method, h):
        original = _still_image(h)
        if original:
            arg = original if method is not "link" else h
            method += "_still"
        else:
            arg = h
            method += "_other"

        return getattr(self, method)(arg)

    def link_still(self, h):
        return domain_url(h)

    link_other = link_still

    def directlink_still(self, h):
        return cdn_url(h)

    def directlink_other(self, h):
        return self.link_other(h) + "/direct"

    frame_still = directlink_still

    def frame_other(self, h):
        return self.link_other(h) + "/frame"

    def markdown_still(self, h):
        return "![](%s)" % domain_url(shard(h))

    def markdown_other(self, h):
        return "[MediaCrush](%s)" % domain_url(h)

    def html_still(self, h):
        return "<img src='%s'>" % domain_url(shard(h))

    def html_other(self, h):
        return "<a href='%s'>MediaCrush</a>" % domain_url(h)

    def bbcode_still(self, h):
        return "[img]%s[/img]" % domain_url(shard(h))

    def bbcode_other(self, h):
        return "[url=%s]MediaCrush[/url]" % domain_url(h)

share = Share()
