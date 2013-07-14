var uploading = false;

function handleFiles(files) {
    if (uploading) {
        return;
    }
    uploading = true;
    uploadFiles(files);
}

function uploadFiles(files) {
    var droparea = document.getElementById('droparea');
    droparea.style.overflowY = 'scroll';
    droparea.innerHTML = '';
    for (var i = 0; i < files.length; i++) {
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
    var image = document.createElement('img');

    var reader = new FileReader();
    reader.onloadend = function(e) {
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);

    wrapper.appendChild(image);
    parentElement.appendChild(wrapper);
}

function showURL(result, url) {
    var text = document.createElement('p');
    text.innerHTML = "Upload complete!";
    var link = document.createElement('a');
    link.href = "/" + url;
    link.setAttribute('target', '_blank');
    link.innerHTML = window.location.origin + "/" + url;
    result.appendChild(text);
    result.appendChild(link);
}

function checkStatus(result, url) {
    console.log("checking in");
    var xhr = new XMLHttpRequest();

    xhr.open('GET', '/gif/status/' + url + '?' + Math.random());
    xhr.onload = function() {
        if (this.responseText == "done") {
            document.getElementById(url + "-spinner").remove();
            showURL(result, url)
        } else {
            // Try again.
            setTimeout(function() {
                checkStatus(result, url);
            }, 1000);
        }
    };

    xhr.send();
}

function uploadFile(progress, result, file) {
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', '/gif/');
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            console.log(e.loaded + " " + e.total + " " + (e.loaded / e.total));
            progress.style.width = (e.loaded / e.total) * 100 + "%";
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
            // Add the spinner overlay
            overlay = document.createElement("div");
            overlay.className = "overlay";
            overlay.setAttribute("id", url + "-spinner");

            img = document.createElement("img");
            img.src = "/static/img/spinner.gif";

            overlay.appendChild(img);
            
            p = result.parentNode;
            p.insertBefore(overlay, p.firstChild);

            // Start a timer that checks whether the gif has finished processing successfully.
            checkStatus(result, url);
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
    formData.append('gif', file);
    xhr.send(formData);
}

function evtNop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

function evtEnter(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.target.className = 'hover';
}

function evtExit(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.target.className = '';
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
    droparea.addEventListener('dragenter', evtEnter, false);
    droparea.addEventListener('dragexit', evtExit, false);
    droparea.addEventListener('dragover', evtNop, false);
    droparea.addEventListener('drop', dropDo, false);
}

window.onload = dropEnable;
