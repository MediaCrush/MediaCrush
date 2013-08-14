function deleteItem(id) {
    if (!window.localStorage)
        return;

    window.localStorage.removeItem('hist:'+id);
    var elem = document.getElementById('hist'+id);
    elem.parentElement.remove(elem);
}

function clearHist() {
    if (window.localStorage) {
        var index = window.localStorage.getItem('hist:index');
        if (index === null)
            return;
        else
            index = parseInt(index);

        for (var i = 0; i < index; i++) {
            window.localStorage.removeItem('hist:'+i);
        }
        window.localStorage.removeItem('hist:index');

        var histList = document.getElementById('ul-hist');
        histList.parentElement.removeChild(histList);
        var pageList = document.getElementById('ul-page');
        pageList.parentElement.removeChild(pageList);
    }
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "; expires=Thu, 01-Jan-1970 00:00:01 GMT";
    document.cookie = name+"="+value+expires+"; path=/";
}

var histOptEnabled = (readCookie('hist-opt-out') === null);
var histOptToggleElem = document.getElementById('hist-opt-toggle');
var disabledText = document.getElementById('disabledText');

if (!histOptEnabled) {
    histOptToggleElem.innerHTML = "enable local history";
    disabledText.className = '';
}

function optOutHistToggle() {
    if (histOptEnabled) {
        createCookie('hist-opt-out', '1', 3650);
        clearHist();
        window.location = "/mine";
    } else {
        createCookie('hist-opt-out', '', 0);
        window.location = "/mine";
    }

    histOptEnabled = !histOptEnabled
}

(function() {
    var container = document.getElementById('ul-hist');

    var templateVideo = document.getElementById('template-video').innerHTML;
    var templateImage = document.getElementById('template-image').innerHTML;
    var templateAudio = document.getElementById('template-audio').innerHTML;

    function addItem(hash, id, data) {
        var type = data.type.split('/')[0];
        var template;

        if (type === 'audio')
            template = templateAudio;
        else if (type == 'video')
            template = templateVideo
        else if (type == 'image') {
            var splits = data.original.split('.');
            template = templateImage;
            template = template.replace(/--IMG-TYPE--/g, splits[splits.length-1]);
        }

        template = template.replace(/--URL--/g, '/'+hash);
        template = template.replace(/--ID--/g, id);

        var temp = document.createElement('div');
        temp.innerHTML = template;

        // append in sorted order
        var children = container.children;
        var i;
        for (i = 0; i < children.length; i++) {
            if (id > parseInt(children[i].id.match(/\d+/)[0])) {
                break;
            }
        }

        if (children.length === 0)
            container.appendChild(temp.firstElementChild);
        else
            container.insertBefore(temp.firstElementChild, children[i]);
    }

    function parseHashes(hashes, display) {
        var hashString = '';
        for (hash in hashes) {
            if (hash in display)
                hashString += hash + ',';
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/info?list=' + hashString);
        xhr.onload = function() {
            if (xhr.status != 200)
                alert("Can't show your history at this time, please refresh the page");

            // clear all elements displayed now
            while (container.lastChild) {
                container.removeChild(container.lastChild);
            }

            var data = JSON.parse(this.response);
            for (hash in data) {
                if (data[hash]) {
                    addItem(hash, hashes[hash], data[hash]);
                }
            }
        }
        xhr.send();
    }

    if (!window.localStorage)
        return;

    var index = window.localStorage.getItem('hist:index');
    if (index === null)
        return;

    index = parseInt(index);
    var allHashes = {};
    var hashes = [];
    for (var i = index; i >= 0; i--) {
        var item = window.localStorage.getItem('hist:'+i);
        if (item) {
            item = JSON.parse(item);
            allHashes[item.hash] = i;
            hashes.push(item.hash);
        }
    }

    // pagination
    var CPAGE = 5;
    var paginateContainer = document.getElementById('ul-page');
    var nodeHTML = "<a href='#--NO--'>--NO--</a>";
    for (var i = 0, len = hashes.length / CPAGE; i < len; i++) {
        var node = document.createElement("li");
        node.innerHTML = nodeHTML.replace(/--NO--/g, i+1);
        paginateContainer.appendChild(node);
    }

    if ("onhashchange" in window) {
        window.onhashchange = function() {
            handleHashChange();
        }
    } else {
        console.log("hashchange polling");
        window.setInterval(function() {
            handleHashChange();
        }, 200);
    }

    if (window.location.hash === '')
        window.location.hash = "#1";

    var currentHash = null;
    handleHashChange();
    function handleHashChange() {
        if (window.location.hash === currentHash)
            return;

        currentHash = window.location.hash;
        if (currentHash === "")
            window.location.hash = "#1";

        var page = parseInt(currentHash.split("#")[1]) - 1;
        page = page * CPAGE;
        var elements = hashes.slice(page, page + CPAGE);

        if (elements.length === 0) {
            window.location.hash = "#1";
            return;
        }

        var displayHashes = {};
        for (var i = 0; i < elements.length; i++)
            displayHashes[elements[i]] = 1;

        parseHashes(allHashes, displayHashes);
    }
})();
