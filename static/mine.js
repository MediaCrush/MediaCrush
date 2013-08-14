function toggleHistory() {
    if (historyEnabled) {
        createCookie('hist-opt-out', '1', 3650);
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
var elements = [];
var ITEMS_PER_PAGE = 10;

window.onload = function() {
    loadHistory();
    if (!historyEnabled) {
        var disabled = document.getElementById('disabledText');
        var link = document.getElementById('history-toggle');
        disabled.className = '';
        link.textContent = 'enable local history';
    }
    createPagination();
    loadDetailedHistory(history, function(result) {
        items = result;
        loadCurrentPage();
    });
    window.onhashchange = function() {
        window.scrollTo(0, 0);
        createPagination();
        loadCurrentPage();
    };
    var debounce = false;
    window.onkeydown = function(e) {
        if (debounce)
            return;
        debounce = true;
        if ([37,72,75].indexOf(e.keyCode) != -1) { // Previous item
            var index = findCurrentElement();
            if (index - 2 >= 0) {
                window.scroll(0, findPos(elements[index - 2]));
                e.preventDefault();
            }
        } else if ([39,74,76].indexOf(e.keyCode) != -1) { // Next item
            var index = findCurrentElement();
            window.scroll(0, findPos(elements[index]));
            e.preventDefault();
        }
    };
    window.onkeyup = function(e) {
        debounce = false;
    };
}

function findCurrentElement() {
    for (var i = 0; i < elements.length; i++) {
        if (findPos(elements[i]) > window.pageYOffset) {
            return i;
        }
    }
    return 0;
}

function findPos(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    return [curtop];
    }
}

function loadCurrentPage() {
    var container = document.getElementById('items');
    while (container.hasChildNodes()) container.removeChild(container.lastChild);
    var page = getCurrentPage();
    var reversedHistory = history.slice(0).reverse();
    elements = [];
    for (var i = page * ITEMS_PER_PAGE; i < page * ITEMS_PER_PAGE + ITEMS_PER_PAGE && i < history.length; i++) {
        var element = createView({ item: items[reversedHistory[i]], hash: reversedHistory[i] });
        container.appendChild(element);
        elements.push(element);
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
        preview = document.createElement('audio');
        preview.setAttribute('controls', 'controls');
        for (var i = 0; i < item.files.length; i++) {
            var source = document.createElement('source');
            source.setAttribute('src', item.files[i].file);
            source.setAttribute('type', item.files[i].type);
            preview.appendChild(source);
        }
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
    if (history.length < ITEMS_PER_PAGE)
        return;
    var pages = history.length / ITEMS_PER_PAGE;
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
        } else if (page >= history.length / ITEMS_PER_PAGE) {
            page = history.length / ITEMS_PER_PAGE - 1;
        }
    }
    return page;
}
