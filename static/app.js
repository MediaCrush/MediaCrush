function handleFiles(files)
{
    var file = files[0]; // TODO
    var xhr = new XMLHttpRequest();
    var dropzone = document.getElementById("dropzone");
    
    xhr.open('POST', '/gif/');
    xhr.upload.onloadstart = function(evt) {
        dropzone.innerHTML = "Uploading...";
    }
    xhr.onload = function() {
        if(this.status == 415) // Unsupported media type
        {
            dropzone.innerHTML = "You need to upload a gif file. Try again.";
        } else if(status == 200) 
        {
            location.href = this.responseText;
        }
    }

    var formData = new FormData();
    formData.append("gif", file);
    xhr.send(formData);
}

function evtNop(evt)
{
    evt.stopPropagation();
    evt.preventDefault();
}

function dropDo(evt)
{
    evtNop(evt);
    var files = evt.dataTransfer.files;
    var count = files.length;

    if(count > 0)
    {
        handleFiles(files);
    }
}

function dropEnable()
{
    var dropzone = document.getElementById("dropzone");
    dropzone.addEventListener("dragenter", evtNop, false);
    dropzone.addEventListener("dragexit", evtNop, false);
    dropzone.addEventListener("dragover", evtNop, false);
    dropzone.addEventListener("drop", dropDo, false);
}

window.onload = dropEnable;
