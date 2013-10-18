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
            }
        }
    }
    document.getElementById('delete').addEventListener('click', function(e) {
        e.preventDefault();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/' + window.filename + '/delete');
        xhr.send();
        document.getElementById('delete').parentElement.innerHTML = 'Deleted';
        if (history) {
            history.remove(hashIndex);
            window.localStorage.setItem('history', JSON.stringify(history));
        }
    }, false);
    var hash = window.location.hash;
    if (hash.length > 1) {
        handleHash(hash);
    }
    var report = document.getElementById('report');
    report.addEventListener('click', function(e) {
        e.preventDefault();
        var report = document.getElementById('report');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/report/' + location.href.split('/')[3]);
        xhr.send();
        report.parentElement.innerHTML = "Reported";
    }, false);
}, false);
function handleHash(hash) {
    if (hash == '#fromExtension') {
        var handled = false;
        for (var i = 0; i < history.length; i++) {
            if (history[i] === window.filename)
                handled = true;
        }
        if (!handled) {
            history.push(window.filename);
            window.localStorage.setItem('history', JSON.stringify(history));
        }
        window.location = window.location.href.substr(0, window.location.href.indexOf('#'));
    } else {
        if (mediaHashHandler)
            mediaHashHandler(hash.substr(1));
    }
}
