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
}, false);
