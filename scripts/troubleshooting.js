window.addEventListener('load', function() {
    var cookie = readCookie('do-not-send');
    var blacklist = [];
    if (cookie) {
        blacklist = JSON.parse(cookie);
        for (var i = 0; i < blacklist.length; i++) {
            // Note: this won't work on IE <= 8
            document.querySelector('input[data-type="' + blacklist[i] + '"]').checked = true;
        }
    }
    var inputs = document.querySelectorAll('input');
    var warning = document.getElementById('warning');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('change', function (e) {
            var mimetype = e.target.getAttribute('data-type');
            if (e.target.checked && !blacklist.contains(mimetype)) {
                blacklist.push(mimetype);
                createCookie('do-not-send', JSON.stringify(blacklist), 3650);
                if (blacklist.length == 3) {
                    warning.classList.remove('hidden');
                }
            } else if (!e.target.checked && blacklist.contains(mimetype)) {
                for (var i = 0; i < blacklist.length; i++) {
                    if (blacklist[i] == mimetype) {
                        blacklist.remove(i);
                        break;
                    }
                }
                createCookie('do-not-send', JSON.stringify(blacklist), 3650);
                if (blacklist.length != 3) {
                    warning.classList.add('hidden');
                }
            }
        }, false);
    }
}, false);
