var uploading = false;

function handleFiles(files) {
    if (uploading) {
        return;
    }
    uploading = true;
    uploadFiles(files);
    return;
    var file = files[0]; // TODO
    var xhr = new XMLHttpRequest();
    var droparea = document.getElementById('droparea');
    
    xhr.open('POST', '/gif/');
    xhr.upload.onloadstart = function(evt) {
    };
    xhr.onload = function() {
        var status = this.status;
        if (status == 415) { // Unsupported media type
            droparea.innerHTML = 'You need to upload a gif file. Try again.';
            uploading = false;
        } else if (status == 409) { // Conflict
            droparea.innerHTML = 'That .gif is already uploaded.';
            uploading = false;
        } else if (status == 400) { // Bad Request
            droparea.innerHTML = 'Bad request. Please specify a quality in the 1..10 range.'; 
            uploading = false;
        } else if (status == 500) { // Internal Server Error
            droparea.innerHTML = 'Server error. Please try again.'; 
            uploading = false;
        } else if (status == 200) { // Ok
            //location.href = this.responseText;
            uploading = false;
        }
    };

    var formData = new FormData();
    formData.append('gif', file);
    xhr.send(formData);
}

function uploadFiles(files) {
    var droparea = document.getElementById('droparea');
    droparea.style.overflowY = 'scroll';
    droparea.innerHTML = '';
    for (var i = 0; i < files.length; i++) {
        var element = document.createElement('div');
        element.setAttribute('class', 'image-loading');
        prepareImage(element, files[i]);
        
        var name = document.createElement('h2');
        name.innerHTML = files[i].name;

        var result = document.createElement('div');

        var progress = document.createElement('div');
        progress.setAttribute('class', 'progress');

        var clearfix = document.createElement('div');
        clearfix.setAttribute('class', 'clearfix');

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
    var image = document.createElement('img');

    var reader = new FileReader();
    reader.onloadend = function(e) {
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);

    wrapper.appendChild(image);
    parentElement.appendChild(wrapper);
}

function uploadFile(progress, result, file) {
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', '/gif/');
    xhr.onprogress = function(e) {
        if (e.lengthComputable) {
            progress.style.width = (e.loaded / e.total) * 100 + "%";
        }
    };
    xhr.onload = function() {
        progress.style.width = 0;
        var status = this.status;
        console.log(this.responseText);
        var error = '';
        if (status == 415) {        // Unsupported media type
            error = 'This image format is not supported.';
        } else if (status == 200 || status == 409) { // OK/already uploaded
            var text = document.createElement('p');
            text.innerHTML = "Upload complete!";
            var link = document.createElement('a');
            link.href = "/" + this.responseText;
            link.setAttribute('target', '_blank');
            link.innerHTML = window.location.origin + "/" + this.responseText;
            result.appendChild(text);
            result.appendChild(link);
        } else {
            error = 'An error has occured. Please try again.';
        }
    };

    var formData = new FormData();
    formData.append('gif', file);
    xhr.send(formData);
}

function evtNop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

function dropDo(evt) {
    evtNop(evt);
    var files = evt.dataTransfer.files;
    var count = files.length;

    if (count > 0) {
        handleFiles(files);
    }
}

function dropEnable() {
    var droparea = document.getElementById('droparea');
    droparea.addEventListener('dragenter', evtNop, false);
    droparea.addEventListener('dragexit', evtNop, false);
    droparea.addEventListener('dragover', evtNop, false);
    droparea.addEventListener('drop', dropDo, false);
}

window.onload = dropEnable;
