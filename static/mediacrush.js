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
    var renderImage = function(target, media) {
        var image = document.createElement('img');
        image.src = self.domain + media.files[0].file;
        target.appendChild(image);
        target.classList.remove('mediacrush');
        target.classList.add('mediacrush-processed');
    };
    var renderVideo = function(target, media) {
        var video = document.createElement('div');
        video.classList.add('video');
        video.classList.add('mediacrush');
            var videoElement = document.createElement('video');
            videoElement.id = 'video-' + media.id;
            if (media.type == 'image/gif') {
                videoElement.loop = true;
            }
            for (var i = 0; i < media.files.length; i++) {
                var source = document.createElement('source');
                source.src = media.files[i].file;
                source.type = media.files[i].type;
                videoElement.appendChild(source);
            }
        video.appendChild(videoElement);
        // Should we just use an iframe here?
    };

    /*
     * Translates a .mediacrush div into an embedded MediaCrush object.
     */
    self.render = function(element) {
        var hash = element.getAttribute('data-media');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', self.domain + '/api/' + hash);
        xhr.onload = function() {
            var media = JSON.parse(this.responseText);
            if (media.type.indexOf('video/') == 0 || media.type == 'image/gif') {
                renderVideo(element, media);
            } else if (media.type.indexOf('image/') == 0) {
                renderImage(element, media);
            }
        };
        xhr.send();
    };

    /*
     * Initializes MediaCrush, injecting stylesheets and such.
     * You don't need to call this unless you use preventMediaCrushAutoload.
     */
    self.initialize = function() {
        var styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.type = 'text/css';
        styles.href = self.domain + '/static/mediacrush.css';
        document.getElementsByTagName('head')[0].appendChild(styles);
    };

    return self;
}());

window.addEventListener('load', function() {
    if (window.preventMediaCrushAutoload) {
        return;
    }
    MediaCrush.initialize();
}, false);
