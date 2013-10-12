# mediacrush.js

We have a nice Javascript library for integrating MediaCrush into your website. You can get the latest
version [here](/static/mediacrush.js), or you can just use this:

    <script type="text/javascript" src="https://mediacru.sh/static/mediacrush.js"></script>

## Usage

This library exposes a `MediaCrush` object, which you can use to interface with the MediaCrush API.
Additionally, the library will render any elements in your document that look like this:

    <div class="mediacrush" data-media="tG6dvDt2jNcr"></div>

To suppress this behavior, set `window.preventMediaCrushAutoload` before loading mediacrush.js.

mediacrush.js can also be used to embed MediaCrush objects into pages. This is the preferred means of
embedding files in third party sites. You can embed any MediaCrush file into a div, and it will
look like:

* Images will be inserted into the div directly
* Video and audio will be inserted in the form of an iframe sized to fit the contents correctly

Regarding the iframe sizing - mediacrush.js will insert the iframe into the page with `display: none`
and communicate with it to receive details on the resolution of the media within. It will then
size the iframe correctly and remove the `display: none`, then call the callback (if applicable).

## MediaCrush

The MediaCrush object provides access to the MediaCrush API, with several methods and properties.

### MediaCrush.domain

This defaults to `https://mediacru.sh`. You may modify it to use alternate MediaCrush instances.

### MediaCrush.version

Returns the current version (integer) of the API and the mediacrush.js script.

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

### MediaCrush.exists(hash, callback)

Checks if the specified hash exists on MediaCrush. Calls back with a boolean.

### MediaCrush.checkStatus(hash, callback)

Checks the status of a processing media blob and calls back with the status, and the result. You should usually
just use the `Media.update` function from MediaCrush.upload.

### MediaCrush.upload(file, callback, progress)

Uploads the given [File](https://developer.mozilla.org/en-US/docs/Web/API/File?redirectlocale=en-US&redirectslug=DOM%2FFile)
to MediaCrush and calls back with a `Media` object. In some cases, this object will immediately finish processing and
will have its status set to 'done'. In most cases, you'll have to use the `update` function on the returned object.

If set, `progress` will be given to the XHR request's `onprogress` property.

### MediaCrush.upload(url, callback, progress)

Uploads the specified url to MediaCrush and calls back with a `Media` object. In some cases, this object will immediately
finish processing and will have its status set to 'done'. In most cases, you'll have to use the `update` function on the
returned object.

### MediaCrush.render(element)

Renders a specific MediaCrush DOM element. The element should look like this:

    <div class="mediacrush" data-media="tG6dvDt2jNcr"></div>

### MediaCrush.renderAll()

Discovers and renders all MediaCrush DOM elements. They should look like this:

    <div class="mediacrush" data-media="tG6dvDt2jNcr"></div>

This is preferred to using `MediaCrush.render` several times, since this will look them all up at once with a single
HTTP request.

## Media

The `Media` object is returned by several functions, notably the upload function.

### Media.update(callback)

Checks the status of the Media object and calls the callback with itself when it's done.

### Media.delete(callback)

Deletes the Media object from the MediaCrush servers. You can only do this if your IP matches the bcrypted IP stored in
the MediaCrush database. Calls back with a boolean indicating success.

### Media.wait(callback)

Polls MediaCrush for the status of this object. Calls back with the updated object as soon as the status is not 'processing'.
