/*
 * MediaCrush JavaScript Library
 * https://mediacru.sh
 * https://github.com/MediaCrush/MediaCrush
 * MIT License http://opensource.org/licenses/MIT
 */
window.MediaCrush = (function() {
    var self = this;
    self.version = 1;
    self.domain = 'https://mediacru.sh/';
    self.maxMediaWidth = -1;
    self.maxMediaHeight = -1;
    self.preserveAspectRatio = true;

    /*
     * Private methods/properties
     */
    var createRequest = function(method, url) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, self.domain + url);
        xhr.setRequestHeader('X-CORS-Status', 'true');
        return xhr;
    };

    var createMediaObject = function(blob) {
        blob.status = null;
        blob.url = self.domain + '/' + blob.hash;
        blob.update = function(callback) {
            self.checkStatus(blob.hash, function(value, result) {
                if (value == 'done') {
                    for (prop in result[blob.hash]) {
                        blob[prop] = result[blob.hash][prop];
                    }
                }
                blob.status = value;
                if (callback)
                    callback(blob);
            });
        };
        blob.delete = function(callback) {
            self.delete(blob.hash, function(value) {
                if (callback)
                    callback(value);
            });
        };
        blob.wait = function(callback) {
            if (blob.status != 'processing') {
                if (callback)
                    callback(blob);
            } else {
                setTimeout(function() {
                    blob.update(function(a) { a.wait(callback); });
                }, 1000);
            }
        };
        return blob;
    };

    var renderImage = function(target, media, callback) {
        var image = document.createElement('img');
        image.src = self.domain + media.files[0].file;
        if (self.maxMediaWidth != -1) {
            image.style.maxWidth = self.maxMediaWidth;
        }
        if (self.maxMediaHeight != -1) {
            image.style.maxHeight = self.maxMediaHeight;
        }
        target.appendChild(image);
        target.classList.remove('mediacrush');
        target.classList.add('mediacrush-processed');
        if (callback)
            callback(target, media);
    };

    var iframes = {};
    var renderMedia = function(target, media, options, callback) {
        var iframe = document.createElement('iframe');
        var src = self.domain + '/' + media.hash + '/frame';
        if (options != '')
            src += '#' + options;
        iframe.src = src;
        iframe.setAttribute('frameborder', 0);
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('allowFullscreen', 'true');
        iframes[media.hash] = { frame: iframe, media: media, callback: callback };
        target.appendChild(iframe);
        target.classList.remove('mediacrush');
        target.classList.add('mediacrush-processed');
    };

    window.addEventListener('message', function(e) {
        var frame = iframes[e.data.media];
        if (frame) {
            var width = e.data.width;
            var height = e.data.height;
            if (width <= 0 || height <= 0) {
                return;
            }
            var aspectRatio = width / height;
            console.log([ width, height, aspectRatio ]);
            // All albums are 720px wide and don't work well at other resolutions
            // TODO: Consider making them work well at other resolutions
            if (frame.media.mimetype != 'application/album') {
                if (self.maxMediaWidth != -1) {
                    if (width > maxMediaWidth) {
                        var difference = maxMediaWidth / width;
                        width = maxMediaWidth;
                        if (self.preserveAspectRatio) {
                            height = height * difference;
                        }
                    }
                }
                if (self.maxMediaHeight != -1) {
                    if (height > maxMediaHeight) {
                        var difference = maxMediaHeight / height;
                        height = maxMediaHeight;
                        if (self.preserveAspectRatio) {
                            width = width * difference;
                        }
                    }
                }
                if (self.preserveAspectRatio && aspectRatio != width / height) {
                    return;
                }
                console.log([ width, height, width / height ]);
                frame.frame.width = width;
                frame.frame.height = height;
            }
            if (frame.callback)
                frame.callback(frame.frame.parentElement, frame.media);
        }
    }, false);

    /*
     * Retrieves information for the specified hashes.
     */
    self.get = function(hashes, callback) {
        var xhr;
        if (hashes instanceof Array) {
            xhr = createRequest('GET', '/api/info?list=' + hashes.join(','));
        } else {
            xhr = createRequest('GET', '/api/' + hashes);
        }
        xhr.onload = function() {
            if (callback) {
                var result = JSON.parse(this.responseText);
                if (hashes instanceof Array) {
                    var array = [];
                    var dictionary = {};
                    for (blob in result) {
                        if (blob.length != 12)
                            continue;
                        if (result[blob] == null) {
                            array.push(result[blob]);
                            dictionary[blob] = result[blob];
                            result[blob].hash = blob;
                            dictionary[blob].hash = blob;
                        } else {
                            var media = createMediaObject(result[blob]);
                            media.hash = blob;
                            array.push(media);
                            dictionary[blob] = media;
                        }
                    }
                    if (callback)
                        callback(array, dictionary);
                } else {
                    if (callback) {
                        var media = createMediaObject(result);
                        media.hash = hashes;
                        callback(media);
                    }
                }
            }
        };
        xhr.send();
    };

    /*
     * Checks if the specified hash exists on MediaCrush.
     */
    self.exists = function(hash, callback) {
        var xhr = createRequest('GET', '/api/' + hash + '/exists');
        xhr.onload = function() {
            if (callback)
                callback(JSON.parse(this.responseText).exists);
        };
        xhr.send();
    };

    /*
     * Deletes the specified media blob from MediaCrush, if the user is allowed to.
     */
    self.delete = function(hash, callback) {
        var xhr = createRequest('DELETE', '/api/' + hash);
        xhr.onload = function() {
            var result = JSON.parse(this.responseText);
            if (callback)
                callback(result['x-status'] == 200);
        };
        xhr.onerror = function() {
            if (callback)
                callback(false);
        };
        xhr.send();
    };

    /*
     * Checks the processing status of the specified hash.
     */
    self.checkStatus = function(hash, callback) {
        var xhr = createRequest('GET', '/api/' + hash + '/status');
        xhr.onload = function() {
            var result = JSON.parse(this.responseText);
            if (callback)
                callback(result['x-status'], result);
        };
        xhr.send();
    };

    /*
     * Uploads a file or URL to MediaCrush.
     */
    self.upload = function(file, callback, onprogress) {
        var xhr;
        var formData = new FormData();
        if (file instanceof File) {
            xhr = createRequest('POST', '/api/upload/file');
            formData.append('file', file);
        } else {
            xhr = createRequest('POST', '/api/upload/url');
            formData.append('url', file);
        }
        xhr.upload.onprogress = onprogress;
        xhr.onload = function() {
            var json = JSON.parse(this.responseText);
            var blob = { hash: json.hash };
            if (json['x-status'] == 409) {
                blob.status = 'done';
            } else {
                blob.status = 'processing';
            }
            if (callback)
                callback(createMediaObject(blob));
        };
        xhr.send(formData);
    };

    /*
     * Translates a .mediacrush div into an embedded MediaCrush object.
     */
    self.render = function(element, callback) {
        var hash = element.getAttribute('data-media');
        var options = '';
        if (hash.indexOf('#') == 12) {
            options = hash.split('#')[1];
            hash = hash.split('#')[0];
        }
        self.get(hash, function(media) {
            if (media.type.indexOf('image/') == 0 && media.type != 'image/gif') {
                renderImage(element, media, callback);
            } else {
                renderMedia(element, media, options, callback);
            }
        });
    };

    self.renderAll = function() {
        var elements = document.querySelectorAll('div.mediacrush');
        var hashes = [];
        for (var i = 0; i < elements.length; i++) {
            var hash = elements[i].getAttribute('data-media');
            if (hash) {
                if (hash.indexOf('#') == 12) {
                    hash = hash.split('#')[0];
                }
                hashes.push(hash);
            }
        }
        if (hashes.length == 0)
            return;
        self.get(hashes, function(array, result) {
            for (var i = 0; i < elements.length; i++) {
                var hash = elements[i].getAttribute('data-media');
                var options = '';
                if (hash.indexOf('#') == 12) {
                    options = hash.split('#')[1];
                    hash = hash.split('#')[0];
                }
                if (hash && result[hash]) {
                    if (result[hash].type.indexOf('image/') == 0 && result[hash].type != 'image/gif') {
                        renderImage(elements[i], result[hash]);
                    } else {
                        renderMedia(elements[i], result[hash], options);
                    }
                }
            }
        });
    };

    self.play = function(media) {
        var hash = media.getAttribute('data-media');
        if (iframes[hash]) {
            iframes[hash].frame.contentWindow.postMessage({ action: 'play' }, '*');
        }
    };

    self.pause = function(media) {
        var hash = media.getAttribute('data-media');
        if (iframes[hash]) {
            iframes[hash].frame.contentWindow.postMessage({ action: 'pause' }, '*');
        }
    };

    return self;
}());

window.addEventListener('load', function() {
    if (window.preventMediaCrushAutoload) {
        return;
    }
    if (window.beforeMediaCrushLoad) {
        window.beforeMediaCrushLoad();
    }
    MediaCrush.renderAll();
}, false);
