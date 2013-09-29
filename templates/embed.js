(function() {
    var scripts = document.getElementsByTagName('script');
    var script = scripts[scripts.length - 1];
    window.addEventListener('load', function() {
        var xhr = new XMLHttpRequest();
        var root = "https://mediacru.sh/";
        xhr.open('GET', root + '{{ hash }}.json');
        xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
        xhr.onload = function() {
            if (xhr.status != 200)
                return;
            var data = JSON.parse(this.response);
            var preview = null;
            if (data.type == 'image/gif' || data.type.indexOf('video/') == 0) {
                preview = document.createElement('video');
                for (var i = 0; i < data.files.length; i++) {
                    var source = document.createElement('source');
                    source.setAttribute('src', root + data.files[i].file);
                    source.setAttribute('type', data.files[i].type);
                    preview.appendChild(source);
                }
                if (data.type == 'image/gif') {
                    preview.setAttribute('autoplay', 'autoplay');
                    preview.setAttribute('loop', 'loop');
                } else {
                    preview.setAttribute('controls', 'controls');
                }
            } else if (data.type.indexOf('image/') == 0) {
                preview = document.createElement('img');
                preview.src = root + data.files[0].file;
            } else if (data.type.indexOf('audio/') == 0) {
                preview = document.createElement('audio');
                for (var i = 0; i < data.files.length; i++) {
                    var source = document.createElement('source');
                    source.setAttribute('src', root + data.files[i].file);
                    source.setAttribute('type', data.files[i].type);
                    preview.appendChild(source);
                }
                preview.setAttribute('controls', 'controls');
            } else {
                return;
            }
            var wrapper = document.createElement('div');
            wrapper.setAttribute('data-type', data.type);
            wrapper.setAttribute('data-id', '{{ hash }}');
            wrapper.className = 'mediacrush-embed';
            wrapper.appendChild(preview);
            script.parentElement.insertBefore(wrapper, script);
        };
        xhr.send();
    }, false);
}());
