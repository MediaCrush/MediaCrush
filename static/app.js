var firstUpload = true;
var uploads = 0;

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function adOptOut() {
    createCookie('ad-opt-out', '1', 0);
    var gad = document.getElementById('gad');
    var lgad = document.getElementById('lgad');
    gad.parentElement.removeChild(gad);
    lgad.parentElement.removeChild(lgad);
}

function handleFiles(files) {
    uploadFiles(files);
}

function uploadFiles(files) {
    var droparea = document.getElementById('droparea');
    droparea.style.overflowY = 'scroll';
    if (firstUpload) {
        droparea.innerHTML = '';
        firstUpload = false;
    }
    for (var i = 0; i < files.length; i++) {
        uploads++;
        var element = document.createElement('div');
        element.className = 'image-loading';
        prepareImage(element, files[i]);
        
        var name = document.createElement('h2');
        name.innerHTML = files[i].name;

        var result = document.createElement('div');

        var progress = document.createElement('div');
        progress.className = 'progress';

        var clearfix = document.createElement('div');
        clearfix.className = 'clearfix';

        element.appendChild(name);
        element.appendChild(result);
        element.appendChild(progress);
        element.appendChild(clearfix);
        droparea.appendChild(element);

        uploadFile(progress, result, files[i]);
    }
}

function prepareImage(parentElement, file) {
    var wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'img-wrapper');
    var reader = new FileReader();

    if(file.type.indexOf("image") != -1) {
        var image = document.createElement('img');

        reader.onloadend = function(e) {
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);

        wrapper.appendChild(image);
    } else if (file.type.indexOf("audio") != -1) {
        var image = document.createElement('img');
        image.src = '/static/audio.png';
        wrapper.appendChild(image);
    } else { 
        var video = document.createElement('video');
        video.setAttribute('loop', 'loop');
        var source = document.createElement('source');

        reader.onloadend = function(e) {
            source.setAttribute('src', e.target.result);
            source.setAttribute('type', file.type);
            video.appendChild(source);
            wrapper.appendChild(video);
            video.volume = 0;
            video.play();
        };
        reader.readAsDataURL(file);
    }
    parentElement.appendChild(wrapper);
}

function showURL(result, url) {
    var text = document.createElement('p');
    text.innerHTML = 'Upload complete!';
    var link = document.createElement('a');
    link.href = '/' + url;
    link.setAttribute('target', '_blank');
    link.innerHTML = window.location.origin + '/' + url;
    result.appendChild(text);
    result.appendChild(link);
    uploads--;
}

function checkStatus(processing, progress, result, url) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', '/upload/status/' + url);
    xhr.onload = function() {
        var response = this.responseText;
        if (response == 'done') {
            progress.style.width = 0;
            processing.parentElement.removeChild(processing);
            showURL(result, url)
        } else if (response == 'timeout' || response == 'error') {
            error = document.createElement("span");
            if (response == 'timeout') {
                error.innerHTML = "This file took too long to process.";
            } else {
                error.innerHTML = "There was an error processing this file.";
            }

            error.className = "error";
            result.appendChild(error);
            uploads--;
        } else {
            // Try again.
            setTimeout(function() {
                checkStatus(processing, progress, result, url);
            }, 1000);
        }
    };

    xhr.send();
}

function uploadFile(progress, result, file) {
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', '/upload/');
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            progress.style.width = (e.loaded / e.total) * 100 + '%';
        }
    };
    xhr.onload = function() {
        progress.style.width = 0;
        var status = this.status;
        var error = '';
        var url = this.responseText;

        if (status == 415) {        // Unsupported media type
            error = 'This image format is not supported.';
        } else if (status == 409) { // Already uploaded
            showURL(result, url);
        } else if (status == 200) { // OK
            processing = document.createElement('span');
            processing.innerHTML = 'Processing...';

            progress.style.width = "100%";
            progress.className += " progress-green"
            result.appendChild(processing);

            // Start a timer that checks whether the gif has finished processing successfully.
            checkStatus(processing, progress, result, url);
        } else if (status == 400) {
            error = 'You have consumed your hourly quota. Please try again later.';
        } else {
            error = 'An error has occured. Please try again.';
        }
        if (error != '') {
            var errorText = document.createElement('p');
            errorText.innerHTML = 'Error: ' + error;
            errorText.className = 'error';
            result.appendChild(errorText);
        }
    };

    var formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
}

function dragNop(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragDrop(e) {
    dragNop(e);
    var droparea = document.getElementById('droparea');
    droparea.className = null;
    var files = e.dataTransfer.files;
    var count = files.length;

    if (count > 0) {
        handleFiles(files);
    }
}

function dragEnter(e) {
    dragNop(e);
    var droparea = document.getElementById('droparea');
    droparea.className = 'hover';
}

function dragLeave(e) {
    dragNop(e);
    var droparea = document.getElementById('droparea');
    droparea.className = null;
}

function dropEnable() {
    var droparea = document.getElementById('droparea');
    droparea.addEventListener('dragenter', dragEnter, false);
    droparea.addEventListener('dragleave', dragLeave, false);
    droparea.addEventListener('dragover', dragNop, false);
    droparea.addEventListener('drop', dragDrop, false);
}

window.onload = dropEnable;
window.onbeforeunload = function() {
    if (uploads != 0) {
        return "If you leave the page, these uploads will be cancelled.";
    }
};
