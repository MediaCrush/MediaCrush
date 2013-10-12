/*
 * MediaCrush JavaScript Library
 * https://mediacru.sh
 * https://github.com/MediaCrush/MediaCrush
 * MIT License http://opensource.org/licenses/MIT
 */
window.MediaCrush = (function() {
    var self = this;
    self.version = 1;
    self.domain = 'http://localhost:5000'; // TODO
    self.settings = {
        basicVideo: false,
        basicAudio: false,
    };

    /*
     * Private methods/properties
     */
    var createRequest = function(method, url) {
        var xhr = new XMLHttpRequest();
        xhr.setRequestHeader('X-CORS-Status', 'true');
        xhr.open(method, self.domain + url);
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

    var renderImage = function(target, media) {
        var image = document.createElement('img');
        image.src = self.domain + media.files[0].file;
        target.appendChild(image);
        target.classList.remove('mediacrush');
        target.classList.add('mediacrush-processed');
    };

    var renderMedia = function(target, media) {
    };

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
                        result[blob].hash = blob;
                        if (result[blob] == null) {
                            array.push(result[blob]);
                            dictionary[blob] = result[blob];
                        } else {
                            var media = createMediaObject(result[blob]);
                            array.push(media);
                            dictionary[blob] = media;
                        }
                    }
                    if (callback)
                        callback(array, dictionary);
                } else {
                    if (callback)
                        callback(createMediaObject(result));
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
        var xhr = createRequest('GET', '/api/' + hash + '/delete');
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
        xhr.onprogress = onprogress;
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
    self.render = function(element) {
        var hash = element.getAttribute('data-media');
        self.get(hash, function(media) {
            if (media.type.indexOf('image/') == 0 && media.type != 'image/gif') {
                renderImage(element, media);
            } else {
                renderMedia(element, media);
            }
        });
    };

    self.renderAll = function() {
        var elements = document.querySelectorAll('div.mediacrush');
        var hashes = [];
        for (var i = 0; i < elements.length; i++) {
            var hash = elements[i].getAttribute('data-media');
            if (hash) {
                hashes.push(hash);
            }
        }
        self.get(hashes, function(array, result) {
            for (var i = 0; i < elements.length; i++) {
                var hash = elements[i].getAttribute('data-media');
                if (hash && result[hash]) {
                    if (result[hash].type.indexOf('image/') == 0 && result[hash].type != 'image/gif') {
                        renderImage(elements[i], result[hash]);
                    } else {
                        renderMedia(elements[i], result[hash]);
                    }
                }
            }
        });
    };

    return self;
}());

window.addEventListener('load', function() {
    if (window.preventMediaCrushAutoload) {
        return;
    }
    MediaCrush.renderAll();
}, false);
