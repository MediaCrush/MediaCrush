function handleFiles(files, quality)
{
    var file = files[0]; // TODO
    var xhr = new XMLHttpRequest();
    var dropzone = document.getElementById("dropzone");
    
    xhr.open('POST', '/gif/');
    xhr.upload.onloadstart = function(evt) {
        dropzone.innerHTML = "Uploading...";
    }
    xhr.onload = function() {
        console.log(this);
        var status = this.status;
        if(status == 415) // Unsupported media type
        {
            dropzone.innerHTML = "You need to upload a gif file. Try again.";
        } else if(status == 409) // Conflict
        {
            dropzone.innerHTML = "That .gif is already uploaded.";
        } else if(status == 400) // Bad Request
        {
            dropzone.innerHTML = "Bad request. Please specify a quality in the 1..10 range."; 
        } else if(status == 500) // Internal Server Error
        {
            dropzone.innerHTML = "Server error. Please try again."; 
        } else if(status == 200) // Ok
        {
            location.href = this.responseText;
            console.log(this.responseText);
        }
    }

    var formData = new FormData();
    formData.append("gif", file);
    formData.append("quality", quality);
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
        handleFiles(files, 5);
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
