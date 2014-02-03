(function(xhr) {
    var open = XMLHttpRequest.prototype.open;
    xhr.prototype.open = function() {
        open.apply(this, arguments);
        this.setRequestHeader('X-Requested-With','XMLHttpRequest');
    };
})(XMLHttpRequest);

var history = [];
var historyEnabled = true;
function loadHistory() {
    historyEnabled = readCookie('hist-opt-out') === null;
    history = JSON.parse(window.localStorage.getItem('history'));
    if (!history) {
        history = [];
    }
}
function saveHistory() {
    window.localStorage.setItem('history', JSON.stringify(history));
}
function addItemToHistory(hash) {
    if (!historyEnabled)
        return;
    for (var i = 0; i < history.length; i++) {
        if (history[i] === hash)
            return;
    }
    history.push(hash);
    saveHistory();
}
function clearHistory() {
    if (!window.localStorage)
        return;
    history = [];
    window.localStorage.setItem('history', JSON.stringify(history));
}
function removeItemFromHistory(hash) {
    for (var i = 0; i < history.length; i++) {
        if (history[i] == hash) {
            history.remove(i);
            break;
        }
    }
    saveHistory();
}
function loadDetailedHistory(items, callback) {
    if (items.length == 0) callback([]);
    var hashes = items.join(',');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/info?list=' + hashes);
    xhr.onload = function() {
        if (xhr.status != 200) {
            var itemsElement = document.getElementById('items');
            itemsElement.innerHTML = 'There was an error showing your history, sorry.';
            return;
        }
        var result = JSON.parse(this.response);
        if (callback) callback(result);
    };
    xhr.send();
}

var uploads = 0;
function browse() {
    var file = document.getElementById('browse');
    file.click();
}

function handleFiles(files) {
    var area = document.getElementById('files');
    area.className = '';
    var blurb = document.getElementById('blurb');
    blurb.className = 'hidden';
    var timeout = 500;
    for (var i = 0; i < files.length; i++) {
        uploads++;
        if (i == 0)
            handleFile(files[i]);
        else {
            void function(i) {
                setTimeout(function() {
                    handleFile(files[i]);
                }, timeout);
            }(i);
            timeout += 500;
        }
    }
}

function handleFile(file) {
    var reader = new FileReader();
    reader.onloadend = function(e) {
        var data = e.target.result;
        var hash = btoa(rstr_md5(data)).substr(0, 12).replace('+', '-').replace('/', '_');
        var preview = createPreview(file);
        if (!preview.supported) {
            var error = document.createElement('span');
            error.className = 'error';
            error.textContent = 'This filetype is not supported.';
            preview.fileStatus.appendChild(error);
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/' + hash + '/exists');
            xhr.onload = function() {
                if (this.status == 200) {
                    var p = document.createElement('h3');
                    p.textContent = 'Upload complete!';
                    var p2 = document.createElement('p');
                    p2.className = 'small';
                    p.textContent = 'Tap here to view';
                    var a = document.createElement('a');
                    a.setAttribute('target', '_blank');
                    a.href = '/' + hash;
                    a.className = 'full-size';
                    preview.fileStatus.appendChild(a);
                    preview.fileStatus.appendChild(p);
                    preview.fileStatus.appendChild(p2);
                    uploads--;
                    addItemToHistory(hash);
                } else {
                    var p = document.createElement('h3');
                    p.textContent = 'Uploading...';
                    preview.fileStatus.appendChild(p);
                    uploadFile(file, hash, preview.fileStatus, preview.progress);
                }
            };
            xhr.send();
        }
    };
    reader.readAsBinaryString(file);
}

function uploadFile(file, hash, statusUI, progressUI) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload/file');
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            progressUI.style.width = (e.loaded / e.total) * 100 + '%';
        }
    };
    xhr.onload = function() {
        var error = null;
        var responseJSON = JSON.parse(this.responseText);

        if (this.status == 415) {
            error = 'This media format is not supported.';
        } else if (this.status == 409) {
            finish(statusUI, responseJSON['hash']);
        } else if (this.status == 420) {
            error = 'You have consumed your hourly quota. Try again later.';
        } else if (this.status == 200) {
            statusUI.innerHTML = '';
            var p = document.createElement('h3');
            p.textContent = 'Processing...';
            statusUI.appendChild(p);
            hash = responseJSON['hash'];
            progressUI.className += ' progress-green';
            progressUI.style.width = '100%';
            setTimeout(function() {
                checkStatus(hash, statusUI, progressUI);
            }, 1000);
        }
        if (error) {
            progressUI.parentElement.removeChild(progressUI);
            var errorText = document.createElement('p');
            errorText.className = 'error';
            errorText.textContent = error;
            statusUI.appendChild(errorText);
            progressUI.style.width = 0;
        }
    };
    var formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
}

function checkStatus(hash, statusUI, progressUI) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/' + hash + '/status');
    xhr.onload = function() {
        responseJSON = JSON.parse(this.responseText);
        if (responseJSON['status'] == 'ready' || responseJSON['status'] == 'done') {
            progressUI.parentElement.removeChild(progressUI);
            finish(statusUI, hash);
        } else if (responseJSON['status'] == 'timeout' || responseJSON['status'] == 'error') {
            progressUI.parentElement.removeChild(progressUI);
            var error = document.createElement('p');
            error.className = 'error';
            statusUI.innerHTML = '';
            if (responseJSON['status'] == 'timeout') {
                error.textContent = 'This file took too long to process.';
            } else {
                error.textContent = 'There was an error processing this file.';
            }
            statusUI.appendChild(error);
            uploads--;
        } else {
            setTimeout(function() {
                checkStatus(hash, statusUI, progressUI);
            }, 1000);
        }
    };
    xhr.send();
}

function finish(statusUI, hash) {
    var p = document.createElement('h3');
    p.textContent = 'Upload complete! ';
    var a2 = document.createElement('a');
    a2.setAttribute('target', '_blank');
    a2.href = '/' + hash;
    a2.className = 'full-size';
    statusUI.innerHTML = '';
    statusUI.appendChild(a2);
    statusUI.appendChild(p);
    uploads--;
    addItemToHistory(hash);
}

function createPreview(file) {
    var supported = false;
    var container = document.createElement('div');
    container.className = 'image-loading';
    var wrapper = document.createElement('div');
    wrapper.className = 'img-wrapper';
    var uri = URL.createObjectURL(file);

    var preview = null;
    if (file.type.indexOf('image/') == 0) {
        supported = true;
        preview = document.createElement('img');
        preview.src = uri;
    } else if (file.type.indexOf('audio/') == 0) {
        supported = true;
        preview = document.createElement('img');
        preview.src = '/static/audio.png';
    } else if (file.type.indexOf('video/') == 0) {
        supported = true;
        preview = document.createElement('video');
        preview.setAttribute('loop', 'loop');
        var source = document.createElement('source');
        source.setAttribute('src', uri);
        source.setAttribute('type', file.type);
        preview.appendChild(source);
        preview.volume = 0;
        preview.play();
    }

    var fileStatus = document.createElement('div');
    var progress = document.createElement('div');
    progress.className = 'progress';
    progress.style.width = 0;

    if (preview !== null) {
        wrapper.appendChild(preview);
    }
    container.appendChild(wrapper);
    container.appendChild(fileStatus);
    container.appendChild(progress);
    var fileList = document.getElementById('files');
    fileList.appendChild(container);

    return { supported: supported, fileStatus: fileStatus, progress: progress };
}

function pageLoad() {
    var file = document.getElementById('browse');
    file.addEventListener('change', function() {
        handleFiles(file.files);
    }, false);
    var link = document.getElementById('upload');
    link.addEventListener('click', function(e) {
        e.preventDefault();
        browse();
    }, false);
    setTimeout(handleHistory, 50);
}

function handleHistory() {
    loadHistory();
    var historyElement = document.getElementById('history');
    if (history.length != 0) {
        historyElement.className = '';
    }
    var items = history.slice(history.length - 4).reverse();
    loadDetailedHistory(items, function(result) {
        for (var i = 0; i < items.length; i++) {
            historyElement.appendChild(createHistoryItem({
                item: result[items[i]],
                hash: items[i]
            }));
        }
    });
}

function createHistoryItem(data) {
    var item = data.item;
    var container = document.createElement('div');
    container.className = 'history-item';
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
        preview.className = 'item-view';
    } else if (item.type.indexOf('image/') == 0) {
        preview = document.createElement('img');
        preview.src = item.original;
        preview.className = 'item-view';
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
    var a = document.createElement('a');
    a.href = '/' + data.hash;
    a.appendChild(preview);
    container.appendChild(a);
    return container;
}

window.onload = pageLoad;
window.onbeforeunload = function() {
    if (uploads != 0) {
        return "If you leave the page, these uploads will be cancelled.";
    }
};

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab],{type:'image/png'});
}

/* Slightly modified version of https://github.com/blueimp/JavaScript-MD5 */
function h(a,g){var c=(a&65535)+(g&65535);return(a>>16)+(g>>16)+(c>>16)<<16|c&65535}function k(a,g,c,l,q,r,b){return h(h(h(a,g&c|~g&l),h(q,b))<<r|h(h(a,g&c|~g&l),h(q,b))>>>32-r,g)}function m(a,g,c,l,q,r,b){return h(h(h(a,g&l|c&~l),h(q,b))<<r|h(h(a,g&l|c&~l),h(q,b))>>>32-r,g)}function n(a,g,c,l,q,r,b){return h(h(h(a,g^c^l),h(q,b))<<r|h(h(a,g^c^l),h(q,b))>>>32-r,g)}function p(a,g,c,l,q,r,b){return h(h(h(a,c^(g|~l)),h(q,b))<<r|h(h(a,c^(g|~l)),h(q,b))>>>32-r,g)}
window.rstr_md5=function(a){var g,c=[];c[(a.length>>2)-1]=void 0;for(g=0;g<c.length;g+=1)c[g]=0;for(g=0;g<8*a.length;g+=8)c[g>>5]|=(a.charCodeAt(g/8)&255)<<g%32;a=8*a.length;c[a>>5]|=128<<a%32;c[(a+64>>>9<<4)+14]=a;var l,q,r,b=1732584193,d=-271733879,e=-1732584194,f=271733878;for(a=0;a<c.length;a+=16)g=b,l=d,q=e,r=f,b=k(b,d,e,f,c[a],7,-680876936),f=k(f,b,d,e,c[a+1],12,-389564586),e=k(e,f,b,d,c[a+2],17,606105819),d=k(d,e,f,b,c[a+3],22,-1044525330),b=k(b,d,e,f,c[a+4],7,-176418897),f=k(f,b,d,e,c[a+5],
12,1200080426),e=k(e,f,b,d,c[a+6],17,-1473231341),d=k(d,e,f,b,c[a+7],22,-45705983),b=k(b,d,e,f,c[a+8],7,1770035416),f=k(f,b,d,e,c[a+9],12,-1958414417),e=k(e,f,b,d,c[a+10],17,-42063),d=k(d,e,f,b,c[a+11],22,-1990404162),b=k(b,d,e,f,c[a+12],7,1804603682),f=k(f,b,d,e,c[a+13],12,-40341101),e=k(e,f,b,d,c[a+14],17,-1502002290),d=k(d,e,f,b,c[a+15],22,1236535329),b=m(b,d,e,f,c[a+1],5,-165796510),f=m(f,b,d,e,c[a+6],9,-1069501632),e=m(e,f,b,d,c[a+11],14,643717713),d=m(d,e,f,b,c[a],20,-373897302),b=m(b,d,e,f,
c[a+5],5,-701558691),f=m(f,b,d,e,c[a+10],9,38016083),e=m(e,f,b,d,c[a+15],14,-660478335),d=m(d,e,f,b,c[a+4],20,-405537848),b=m(b,d,e,f,c[a+9],5,568446438),f=m(f,b,d,e,c[a+14],9,-1019803690),e=m(e,f,b,d,c[a+3],14,-187363961),d=m(d,e,f,b,c[a+8],20,1163531501),b=m(b,d,e,f,c[a+13],5,-1444681467),f=m(f,b,d,e,c[a+2],9,-51403784),e=m(e,f,b,d,c[a+7],14,1735328473),d=m(d,e,f,b,c[a+12],20,-1926607734),b=n(b,d,e,f,c[a+5],4,-378558),f=n(f,b,d,e,c[a+8],11,-2022574463),e=n(e,f,b,d,c[a+11],16,1839030562),d=n(d,e,
f,b,c[a+14],23,-35309556),b=n(b,d,e,f,c[a+1],4,-1530992060),f=n(f,b,d,e,c[a+4],11,1272893353),e=n(e,f,b,d,c[a+7],16,-155497632),d=n(d,e,f,b,c[a+10],23,-1094730640),b=n(b,d,e,f,c[a+13],4,681279174),f=n(f,b,d,e,c[a],11,-358537222),e=n(e,f,b,d,c[a+3],16,-722521979),d=n(d,e,f,b,c[a+6],23,76029189),b=n(b,d,e,f,c[a+9],4,-640364487),f=n(f,b,d,e,c[a+12],11,-421815835),e=n(e,f,b,d,c[a+15],16,530742520),d=n(d,e,f,b,c[a+2],23,-995338651),b=p(b,d,e,f,c[a],6,-198630844),f=p(f,b,d,e,c[a+7],10,1126891415),e=p(e,
f,b,d,c[a+14],15,-1416354905),d=p(d,e,f,b,c[a+5],21,-57434055),b=p(b,d,e,f,c[a+12],6,1700485571),f=p(f,b,d,e,c[a+3],10,-1894986606),e=p(e,f,b,d,c[a+10],15,-1051523),d=p(d,e,f,b,c[a+1],21,-2054922799),b=p(b,d,e,f,c[a+8],6,1873313359),f=p(f,b,d,e,c[a+15],10,-30611744),e=p(e,f,b,d,c[a+6],15,-1560198380),d=p(d,e,f,b,c[a+13],21,1309151649),b=p(b,d,e,f,c[a+4],6,-145523070),f=p(f,b,d,e,c[a+11],10,-1120210379),e=p(e,f,b,d,c[a+2],15,718787259),d=p(d,e,f,b,c[a+9],21,-343485551),b=h(b,g),d=h(d,l),e=h(e,q),f=
h(f,r);c=[b,d,e,f];g="";for(a=0;a<32*c.length;a+=8)g+=String.fromCharCode(c[a>>5]>>>a%32&255);return g};
