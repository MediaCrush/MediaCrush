# mediacrush.js

We have a nice Javascript library for integrating MediaCrush into your website. You can get the latest
version [here](/static/mediacrush.js), or you can just use this:

    <script type="text/javascript" src="https://mediacru.sh/static/mediacrush.js"></script>

## Usage

This library exposes a `MediaCrush` object, which you can use to interface with the MediaCrush API.
Additionally, the library will render any elements in your document that look like this:

    <div class="mediacrush" data-media="tG6dvDt2jNcr"></div>

To suppress this behavior, set `window.preventMediaCrushAutoload` before loading mediacrush.js.

You may also set `window.beforeMediaCrushLoad` to a function that should be executed before MediaCrush
does its initial sweep of the DOM for `.mediacrush` elements. This gives you a chance to change settings
like `MediaCrush.domain`.

mediacrush.js can also be used to embed MediaCrush objects into pages. This is the preferred means of
embedding files in third party sites. You can embed any MediaCrush file into a div, and it will
look like:

* Images will be inserted into the div directly
* Video and audio will be inserted in the form of an iframe sized to fit the contents correctly

Regarding the iframe sizing - mediacrush.js will insert the iframe into the page with `display: none`
and communicate with it to receive details on the resolution of the media within. It will then
size the iframe correctly and remove the `display: none`, then call the callback (if applicable).

## Examples

**Embed media**

If you have inserted the page into your markup on the server side, just add something like this and
it'll render on `window.onload`:

    <div class="mediacrush" data-media="tG6dvDt2jNcr"></div>

If you add a div like this into the page at runtime, you can use something like this:

    MediaCrush.render(document.getElementById('...')); // One item
    MediaCrush.renderAll(); // Re-discovers and renders all items on the page

MediaCrush.js will preserve all #controls in the data-media attribute. For example, you might do:

    <div class="mediacrush" data-media="tG6dvDt2jNcr#autoplay,loop"></div>

The full list of modifiers is:

* `autoplay`: Forces the media to autoplay
* `noautoplay`: Forces the media not to autoplay
* `loop`: Forces the media to loop
* `noloop`: Forces the media not to loop
* `mute`: Mutes the media by default
* `nobrand`: Does not show MediaCrush branding in the embedded media player (doing this makes us sad, but we won't stop you)

**Upload a file**

Say you have this in your page somewhere:

    <input type="file" id="fileToUpload" />

You can do this to upload it to MediaCrush:

    var file = document.getElementById('fileToUpload').files[0];
    MediaCrush.upload(file, function(media) {
        console.log('Processing...');
        media.wait(function() { // Wait for it to finish processing
            console.log(media.url);
        });
    };

**Get file information**

    MediaCrush.get('tG6dvDt2jNcr', function(media) {
        console.log(media.type);
    });

## MediaCrush

The MediaCrush object provides access to the MediaCrush API, with several methods and properties.

### MediaCrush.domain

This defaults to `https://mediacru.sh`. You may modify it to use alternate MediaCrush instances.

### MediaCrush.maxMediaWidth

Set to -1 (default) for unbounded width. Set to any other value to cause MediaCrush to limit the width of embedded
media to the specified value, in pixels.

### MediaCrush.maxMediaHeight

Set to -1 (default) for unbounded height. Set to any other value to cause MediaCrush to limit the height of embedded
media to the specified value, in pixels.

### MediaCrush.preserveAspectRatio

When true (default), and embedded media has to be limited by maxMediaWidth or maxMediaHeight, mediacrush.js will
preserve the aspect ratio of the embedded media upon scaling it down.

### MediaCrush.version

Returns the current version (integer) of the API and the mediacrush.js script.

### MediaCrush.checkStatus(hash, callback)

Checks the status of a processing media blob and calls back with the status, and the result. You should usually
just use the `Media.update` function from MediaCrush.upload.

### MediaCrush.exists(hash, callback)

Checks if the specified hash exists on MediaCrush. Calls back with a boolean.

### MediaCrush.get(hash, callback)

Retrieves information about the specified hash and calls back with a `Media` object.

    MediaCrush.get('tG6dvDt2jNcr', function(media) {
        // ...
    });

### MediaCrush.get(list, callback)

Retrieves information about several hashes at once and calls back with an array, and a dictionary, of `Media` objects.

    MediaCrush.get([ 'tG6dvDt2jNcr', 'nJlGaGbjQ716' ], function(array, dict) {
        // Use array[integer]
        // Or dict['hash'] to get a specific one
    });

### MediaCrush.render(element, [callback])

Renders a specific MediaCrush DOM element. The element should look like this:

    <div class="mediacrush" data-media="tG6dvDt2jNcr"></div>

When done, it'll call `callback(element, media)` with a `Media` object as the second parameter. `callback` is optional.

### MediaCrush.renderAll()

Discovers and renders all MediaCrush DOM elements. They should look like this:

    <div class="mediacrush" data-media="tG6dvDt2jNcr"></div>

This is preferred to using `MediaCrush.render` several times, since this will look them all up at once with a single
HTTP request.

### MediaCrush.upload(file, callback, progress)

Uploads the given [File](https://developer.mozilla.org/en-US/docs/Web/API/File?redirectlocale=en-US&redirectslug=DOM%2FFile)
to MediaCrush and calls back with a `Media` object. In some cases, this object will immediately finish processing and
will have its status set to 'done'. In most cases, you'll have to use the `update` function on the returned object.

If set, `progress` will be given to the XHR request's `onprogress` property.

### MediaCrush.upload(url, callback, progress)

Uploads the specified url to MediaCrush and calls back with a `Media` object. In some cases, this object will immediately
finish processing and will have its status set to 'done'. In most cases, you'll have to use the `update` function on the
returned object.

## Media

The `Media` object is returned by several functions, notably the upload function.

### Media.compression

If MediaCrush was able to compress this file a bit (losslessly), this will the the compression rate (or zero otherwise).

### Media.files

An array of the files associated with this media (different video formats, etc). Each one looks like this:

    {
        file: '/path-to-file',
        type: 'mimetype'
    }

The path is relative, so you'll have to add `https://mediacru.sh/` if you want it in a page.

### Media.original

The URL to the originally uploaded file.

The URL is relative, so you'll have to add `https://mediacru.sh/` if you want it in a page.

### Media.status

One of these values:

* 'done': When it's done processing and is ready to use
* 'processing': Still processing on MediaCrush
* 'error': Something went wrong while processing
* 'timeout': Took too long to process

Use `Media.update` to refresh this value.

### Media.type

The mimetype of the originally uploaded media.

### Media.url

The URL of this media on MediaCrush, when it's done processing.

### Media.delete(callback)

Deletes the Media object from the MediaCrush servers. You can only do this if your IP matches the bcrypted IP stored in
the MediaCrush database. Calls back with a boolean indicating success.

### Media.update(callback)

Checks the status of the Media object and calls the callback with itself when it's done.

### Media.wait(callback)

Polls MediaCrush for the status of this object. Calls back with the updated object as soon as the status is not 'processing'.
