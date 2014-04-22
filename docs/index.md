# Developer Documentation

If you have any questions about using our service from a development standpoint, please feel free to join
[#mediacrush on irc.freenode.net](http://webchat.freenode.net/?channels=mediacrush&uio=d4) to get help.

## Open Source

MediaCrush is completely open source. If you want to learn more about how something works, or improve
something, head over to [GitHub](https://github.com/MediaCrush/MediaCrush) and hack away.

## Public API

[**API Documentation**](/docs/api)

MediaCrush offers a free API to developers that allows you to upload media and retrieve information on files
on our servers. This API is completely free, but we appreciate a [donation](/donate) if you plan to use it,
since we don't get any ad views from API users. We would also appreciate a donation if you hotlink to us often.

## API Wrappers

Have you written a cool API wrapper for MediaCrush? [Let us know](mailto:support@mediacru.sh) and we'll mention it here.

### Python

* [PyCrush](https://github.com/MediaCrush/PyCrush) - **Official** API wrapper that makes the most out of each HTTP request - MIT license

### JavaScript

* [mediacrush.js](/docs/mediacrush.js) - **Official** JS library for working with MediaCrush in the browser - MIT license

### Java

* [jCrush](https://github.com/hypereddie10/jCrush) - API wrapper written in (and for) Java - MIT license

Note: We're looking for a node.js version of mediacrush.js. Interested in contributing one? Join us on IRC
for a chat: [#mediacrush on irc.freenode.net](http://webchat.freenode.net/?channels=mediacrush&uio=d4).

### .NET

* [Sharus](https://github.com/diantahoc/Sharus) - API wrapper for .NET written in C# - MIT license

### Objective-C

* [MediaCrush-Kit](https://github.com/DeVaukz/MediaCrush-Kit) - API wrapper written in Objective-C for Mac and iOS - MIT license

## Blob Identifiers

We use MD5 hashes* to identify a media blob, which is a collection of files that make up one "media" object.
This hash comes from the originally uploaded file, and is base 64 encoded, with `+` replaced by `-`, and `/`
replaced with `_`. In other words, to get the blob identifier of a file:
`base64(md5(file)).replace('+', '-').replace('/', '_')`. Finally, we take the first 12 characters and
discard the rest of the hash. This becomes the blob identifier - which is what the file appears at when you
visit `/identifier`.

\* Before you cry "security!", realize that MD5 is fine for checksums and we aren't actually using them to
protect sensitive information.

## Embedding Media

It's easy to embed media into your website. For simple cases, just click on 'Embed' on the media
page and paste that HTML into your blog/website/whatever. For more complex cases, you may want to
use [mediacrush.js](/docs/mediacrush.js), which will handle all the heavy lifting for you. It can be
as simple as:

    <div class="mediacrush" data-media="9XtPgnJgFimB"></div>
