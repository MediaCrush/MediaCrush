window.onload = function () {
    var importUrl = document.getElementById('import-url');
    importUrl.focus();
    importUrl.addEventListener('paste', urlPasted, false);
};

function urlPasted(e) {
    setTimeout(function() {
        var importUrl = document.getElementById('import-url');
        var url = importUrl.value;
        var a = document.createElement('a');
        a.href = url;
        var handler = validUrl(a);
        if (handler) {
            var textElement = document.getElementById('import-url-text');
            textElement.className = '';
            textElement.textContent = importUrl.value;
            importUrl.parentElement.removeChild(importUrl);
            document.body.classList.add(handler.name);
            handler.handle(a);
        } else {
            importUrl.value = '';
            importUrl.placeholder = "We can't extract media from that page.";
        }
    }, 100);
}

function validUrl(a) {
    var hostnames = [
        { name: 'youtube', host: 'www.youtube.com', validate: validateYoutube, handle: handleYoutube },
        { name: 'youtube', host: 'youtube.com', validate: validateYoutube, handle: handleYoutube },
        { name: 'youtube', host: 'youtu.be', validate: validateYoutube, handle: handleYoutube }
    ];
    for (var i = 0; i < hostnames.length; i++) {
        if (hostnames[i].host == a.hostname) {
            return hostnames[i];
        }
    }
    return false;
}

function importVideo() {
    var ui = document.getElementById('import-video');
    ui.classList.remove('hidden');
    var embed = document.getElementById('video-embed');
    return { container: ui, embed: embed };
}

// <iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F81596817"></iframe>

function validateYoutube(link) {
    if (link.hostname == 'youtu.be') {
        return true;
    }
    if (link.pathname == '/watch' || link.pathname == '/watch/') {
        return true;
    }
    return false;
}

function handleYoutube(link) {
    var ui = importVideo();
    var embed = document.createElement('iframe');
    embed.width = 450;
    embed.height = 300;
    embed.setAttribute('allowfullscreen', true);
    embed.setAttribute('frameborder', '0');
    var video = null;
    if (link.hostname == 'youtu.be') {
        video = link.pathname.substring(1);
    } else {
        video = QueryString(link).v;
    }
    embed.setAttribute('src', '//www.youtube.com/embed/' + video);
    ui.embed.appendChild(embed);
}

function QueryString(url) {
    var query_string = {};
    var query = url.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]], pair[1] ];
            query_string[pair[0]] = arr;
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    } 
    return query_string;
};
