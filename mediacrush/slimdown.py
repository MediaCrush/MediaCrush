from functools import partial

from markdown import Markdown, odict
from markdown.blockprocessors import build_block_parser
from markdown.preprocessors import build_preprocessors
from markdown.inlinepatterns import build_inlinepatterns
from markdown.treeprocessors import build_treeprocessors

slimdown = Markdown(safe_mode="escape")

# Remove some block parsers
block = build_block_parser(slimdown)
del block.blockprocessors["hashheader"]
del block.blockprocessors["setextheader"]
del block.blockprocessors["olist"]
del block.blockprocessors["ulist"]
slimdown.parser = block

# Delete most inline patterns
inline = build_inlinepatterns(slimdown)
del inline["backtick"]
del inline["reference"]
del inline["image_link"]
del inline["image_reference"]
del inline["short_reference"]
del inline["autolink"]
del inline["automail"]
del inline["entity"]
slimdown.inlinePatterns = inline
