var history = window.localStorage.getItem('history');
history = JSON.parse(history);
if (history == null) {
    history = [];
}
window.addEventListener('load', function() {
    var inputs = document.querySelectorAll('input.selectall');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('mouseenter', function(e) {
            e.target.focus();
            e.target.select();
        });
    }
    document.getElementById('share-link').addEventListener('click', function(e) {
        e.preventDefault();
        var share = document.getElementById('share');
        var embed = document.getElementById('embed');
        if (share.className == 'hidden') {
            share.className = '';
            embed.className = 'hidden';
        }
        else {
            share.className = 'hidden';
        }
    });
    document.getElementById('embed-link').addEventListener('click', function(e) {
        e.preventDefault();
        var share = document.getElementById('share');
        var embed = document.getElementById('embed');
        if (embed.className == 'hidden') {
            embed.className = '';
            share.className = 'hidden';
        }
        else {
            embed.className = 'hidden';
        }
    });
    if (window.can_delete == 'check') {
        var hashIndex = null;
        if (history) {
            var canDelete = false;
            for (var i = 0; i < history.length; i++) {
                if (history[i] == window.filename) {
                    canDelete = true;
                    hashIndex = i;
                    break;
                }
            }
            if (canDelete) {
                document.getElementById('delete').parentElement.classList.remove('hidden');
                var flags = document.getElementById('flags');
                if (flags) {
                    flags.classList.remove('hidden');
                    var checkboxes = flags.querySelectorAll('input');
                    for (var i = 0; i < checkboxes.length; i++) {
                        void function(i) {
                            i.addEventListener('change', function(e) {
                                var flag = i.getAttribute('data-flag');
                                var xhr = new XMLHttpRequest();
                                window.flags[flag] = !window.flags[flag];
                                var formData = new FormData();
                                for (f in window.flags) {
                                    formData.append(f, window.flags[f]);
                                }
                                xhr.open('POST', '/api/' + window.filename + '/flags');
                                xhr.send(formData);
                                updateFlag(flag, window.flags[flag]);
                            }, false);
                        }(checkboxes[i]);
                    }
                }
            }
        }
    }
    document.getElementById('delete').addEventListener('click', function(e) {
        e.preventDefault();
        confirm(function(a) {
            if (!a) return;
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', '/api/' + window.filename);
            xhr.send();
            document.getElementById('delete').parentElement.innerHTML = 'Deleted';
            if (history) {
                history.remove(hashIndex);
                window.localStorage.setItem('history', JSON.stringify(history));
            }
        });
    }, false);
    var hash = window.location.hash;
    if (hash.length > 1) {
        handleHash(hash);
    }
    var report = document.getElementById('report');
    report.addEventListener('click', function(e) {
        e.preventDefault();
        
        confirm(function(a) {
            if(!a) return;
            var report = document.getElementById('report');
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/report/' + location.href.split('/')[3]);
            xhr.send();
            report.parentElement.innerHTML = "Reported";  
        });
    }, false);
    if (window.mediaSizeReporter) {
        var size = mediaSizeReporter();
        size.height += 5;
        var embed = document.getElementById('embed-value');
        embed.value = '<iframe src="{{ protocol }}://{{ domain }}/' + window.filename + '/frame" frameborder="0" allowFullscreen width="' + size.width + '" height="' + size.height + '"></iframe>'
    }
}, false);
function handleHash(hash) {
    var historyEnabled = readCookie('hist-opt-out') === null;
    if (hash == '#fromExtension') {
        if (historyEnabled) {
            var handled = false;
            for (var i = 0; i < history.length; i++) {
                if (history[i] === window.filename)
                    handled = true;
            }
            if (!handled) {
                history.push(window.filename);
                window.localStorage.setItem('history', JSON.stringify(history));
            }
        }
        window.location = window.location.href.substr(0, window.location.href.indexOf('#'));
    } else {
        if (window.mediaHashHandler)
            window.mediaHashHandler(hash.substr(1));
    }
}
function updateFlag(flag, value) {
    if (window.mediaFlagHandler) {
        window.mediaFlagHandler(flag, value);
    }
}
