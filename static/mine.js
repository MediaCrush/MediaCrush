function toggleHistory() {
    if (historyEnabled) {
        createCookie('hist-opt-out', '1', 3650);
        clearHistory();
        window.location = "/mine";
    } else {
        createCookie('hist-opt-out', '', 0);
        window.location = "/mine";
    }
    historyEnabled = !historyEnabled;
}

function clearHistoryAndReload() {
    clearHistory();
    window.location = "/mine";
}

var items = [];

window.onload = function() {
    loadHistory();
    createPagination();
    loadItems(function() {
        loadCurrentPage();
    });
    window.onhashchange = function() {
        window.scrollTo(0, 0);
        createPagination();
        loadCurrentPage();
    };
}

function loadItems(callback) {
    var hashes = history.join(',');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/info?list=' + hashes);
    xhr.onload = function() {
        if (xhr.status != 200) {
            var itemsElement = document.getElementById('items');
            itemsElement.innerHTML = 'There was an error showing your history, sorry.';
            return;
        }
        items = JSON.parse(this.response);
        if (callback) callback();
    };
    xhr.send();
}

function loadCurrentPage() {
    var container = document.getElementById('items');
    while (container.hasChildNodes()) container.removeChild(container.lastChild);
    var page = getCurrentPage();
    var reversedHistory = history.slice(0).reverse();
    for (var i = page * 10; i < page * 10 + 10 && i < history.length; i++) {
        var element = createView({ item: items[reversedHistory[i]], hash: reversedHistory[i] });
        container.appendChild(element);
    }
}

function createView(data) {
    var item = data.item;
    var container = document.createElement('div');
    var preview = null;
    if (item.type == 'image/gif' || item.type.indexOf('video/') == 0) {
        preview = document.createElement('video');
        preview.setAttribute('loop', 'loop');
        for (var i = 0; i < item.files.length; i++) {
            var source = document.createElement('source');
            source.setAttribute('src', item.files[i].file);
            source.setAttribute('type', item.files[i].type);
            preview.appendChild(source);
        }
        preview.volume = 0;
        preview.play();
    } else if (item.type.indexOf('image/') == 0) {
        preview = document.createElement('img');
        preview.src = item.original;
    } else if (item.type.indexOf('audio/') == 0) {
        preview = document.createElement('img');
        preview.src = '/static/audio.png';
    }
    preview.className = 'item';
    var container2 = document.createElement('div');
    var bar = document.createElement('div');
    bar.className = 'bar';
    var deleteLink = document.createElement('a');
    deleteLink.textContent = 'Delete';
    deleteLink.className = 'red left';
    deleteLink.href = '/delete/' + data.hash;
    deleteLink.onclick = function(e) {
        e.preventDefault();
        removeItemFromHistory(data.hash);
        container2.parentElement.removeChild(container2);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/' + data.hash + '/delete');
        xhr.send();
    };
    deleteLink.title = 'Delete this item from the MediaCrush server';
    bar.appendChild(deleteLink);

    var forgetLink = document.createElement('a');
    forgetLink.textContent = 'Forget';
    forgetLink.className = 'right';
    forgetLink.href = '/forget/' + data.hash;
    forgetLink.onclick = function(e) {
        e.preventDefault();
        removeItemFromHistory(data.hash);
        container2.parentElement.removeChild(container2);
        createPagination();
        loadCurrentPage();
    };
    forgetLink.target = 'Remove this item from your history';
    bar.appendChild(forgetLink);

    var a = document.createElement('a');
    a.href = '/' + data.hash;
    a.appendChild(preview);
    container.appendChild(a);
    container.appendChild(bar);
    container2.className = 'item-wrapper';
    container2.appendChild(container);
    container2.id = data.hash;
    return container2;
}

function createPagination() {
    if (history.length < 10)
        return;
    var pages = history.length / 10;
    var pagination = document.getElementById('pagination');
    while (pagination.hasChildNodes()) pagination.removeChild(pagination.lastChild);
    var page = getCurrentPage();
    for (var i = 0; i < pages; i++) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + i;
        a.textContent = (i + 1);
        if (page == i)
            li.className = 'selected';
        li.appendChild(a);
        pagination.appendChild(li);
    }
}

function getCurrentPage() {
    var page = 0;
    if (window.location.hash.length >= 1) {
        page = parseInt(window.location.hash.substr(1));
        if (page == NaN) {
            page = 0;
        }
    }
    return page;
}
