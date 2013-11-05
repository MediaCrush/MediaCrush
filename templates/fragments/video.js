var fullscreenElement;
window.addEventListener('load', function() {
    try {
        if (!window.localStorage.volume) {
            window.localStorage.volume = 1;
        }
    } catch (ex) { /* this causes security exceptions in sandboxed iframes */ }
    var controls = document.querySelectorAll('.video .control');
    for (var i = 0; i < controls.length; i++) {
        controls[i].addEventListener('click', controlClick, false);
    }
    var videos = document.querySelectorAll('video');
    for (var i = 0; i < videos.length; i++) {
        videos[i].addEventListener('ended', function(e) {
            if (!e.target.loop) {
                pause(e.target);
            }
        }, true);
        videos[i].addEventListener('progress', updateVideo, false);
        if (videos[i].readyState > 0) {
            updateVideo({ target: videos[i] });
        }
        videos[i].addEventListener('timeupdate', updateVideo, false);
    }
    var buffers = document.querySelectorAll('.seek .buffering, .seek .progress, .seek .unbuffered');
    for (var i = 0; i < buffers.length; i++) {
        buffers[i].addEventListener('click', handleSeek, false);
    }
    var volumes = document.querySelectorAll('.volume, .volume .amount');
    for (var i = 0; i < volumes.length; i++) {
        var amount = volumes[i].querySelector('.amount');
        try {
            if (amount)
                amount.style.width = (window.localStorage.volume * 100) + '%';
        } catch (ex) {
            amount.style.width = '100%';
        }
        volumes[i].addEventListener('mousedown', beginAdjustVolume, false);
        volumes[i].addEventListener('mousemove', adjustVolume, false);
        volumes[i].addEventListener('mouseup', endAdjustVolume, false);
        volumes[i].addEventListener('mouseleave', endAdjustVolume, false);
    }
    document.addEventListener('mozfullscreenchange', function() {
        if (document.mozFullScreenElement === null) {
            exitFullscreen();
        }
    }, false);
    document.addEventListener('webkitfullscreenchange', function() {
        if (document.mozFullScreenElement === null) {
            exitFullscreen();
        }
    }, false);
    window.addEventListener('keyup', function(e) {
        if (e.keyCode == 27 && fullscreenElement) // esc
            exitFullscreen();
    }, false);
    window.addEventListener('mousemove', windowMouseMove, false);
}, false);
var debounce = false;
function windowMouseMove() {
    if (fullscreenElement && fullscreenElement != null) {
        var hover = fullscreenElement.querySelector('.hover');
        if (hover.className.indexOf('disabled') != -1) {
            hover.classList.remove('disabled');
            debounce = false;
        }
        setTimeout(function() {
            if (debounce) {
                return;
            }
            debounce = true;
            hover.classList.add('disabled');
        }, 3000);
    }
}
function exitFullscreen() {
    if (document.cancelFullScreen)
        document.cancelFullScreen();
    else if (document.webkitCancelFullScreen)
        document.webkitCancelFullScreen();
    else if (document.mozCancelFullScreen)
        document.mozCancelFullScreen();
    else if (fullscreenElement.cancelFullScreen)
        fullscreenElement.cancelFullScreen();
    else if (fullscreenElement.mozCancelFullScreen)
        fullscreenElement.mozCancelFullScreen();
    else if (fullscreenElement.webkitCancelFullScreen)
        fullscreenElement.webkitCancelFullScreen();
    fullscreenElement.classList.remove('fullscreen');
    fullscreenElement.querySelector('.hover').classList.remove('disabled');
    var target = fullscreenElement.querySelector('.window');
    target.classList.remove('window');
    target.classList.add('full');
    fullscreenElement = null;
}
function beginAdjustVolume(e) {
    e.preventDefault();
    var container = e.target;
    if (e.target.className.indexOf('volume') == -1)
        container = e.target.parentElement;
    container.classList.add('action');
    adjustVolume(e);
}
function endAdjustVolume(e) {
    var container = e.target;
    if (e.target.className.indexOf('volume') == -1)
        container = e.target.parentElement;
    container.classList.remove('action');
}
function adjustVolume(e) {
    e.preventDefault();
    var container = e.target;
    if (e.target.className.indexOf('volume') == -1)
        container = e.target.parentElement;
    if (container.className.indexOf('action') == -1)
        return;
    var video = document.getElementById(container.getAttribute('data-video'));
    var amount;
    if (e.offsetX)
        amount = e.offsetX / container.clientWidth;
    else
        amount = e.layerX / container.clientWidth;
    video.volume = amount;
    try {
        window.localStorage.volume = amount;
    } catch (ex) { /* ... */ }
    container.querySelector('.amount').style.width = (amount * 100) + '%';
}
function handleSeek(e) {
    e.preventDefault();
    var container = e.target.parentElement;
    var video = document.getElementById(container.getAttribute('data-video'));
    var seek = video.duration * (e.layerX / container.clientWidth);
    video.currentTime = seek;
}
function updateVideo(e) {
    var video = e.target;
    var buffer = document.querySelectorAll('.seek[data-video="' + video.id + '"] .buffering')[0];
    var progress = document.querySelectorAll('.seek[data-video="' + video.id + '"] .progress')[0];
    var indicator = document.querySelectorAll('.seek[data-video="' + video.id + '"] .indicator')[0];
    var time = document.querySelectorAll('.time[data-video="' + video.id + '"]')[0];
    var bufferWidth;
    if (video.buffered.length == 0)
        bufferWidth = 100;
    else
        bufferWidth = video.buffered.end(video.buffered.length - 1) / video.duration * 100;
    if (bufferWidth > 100)
        bufferWidth = 100;
    buffer.style.width = bufferWidth + '%';
    progress.style.width = indicator.style.left = video.currentTime / video.duration * 100 + '%';
    var minutes = Math.floor(video.currentTime / 60);
    var seconds = Math.floor(video.currentTime % 60);
    if (seconds < 10)
        time.textContent = minutes + ':0' + seconds;
    else
        time.textContent = minutes + ':' + seconds;
}
function controlClick(e) {
    e.preventDefault();
    var target = e.target;
    if (!target.className)
        target = target.parentElement;
    var video = document.getElementById(target.getAttribute('data-video'));
    if (target.className.indexOf('play') != -1) {
        play(video);
        if (target.className.indexOf('large') != -1)
            target.classList.add('hidden');
    } else if (target.className.indexOf('pause') != -1) {
        pause(video);
    } else if (target.className.indexOf('loop') != -1) {
        video.loop = !video.loop;
        if (video.loop) {
            removeHash('noloop');
            addHash('loop');
        } else {
            removeHash('loop');
            addHash('noloop');
        }
        if (video.paused)
            play(video);
        if (target.className.indexOf('enabled') != -1)
            target.classList.remove('enabled');
        else
            target.classList.add('enabled');
    } else if (target.className.indexOf('unmute') != -1) {
        video.muted = false;
        target.classList.remove('unmute');
        target.classList.add('mute');
    } else if (target.className.indexOf('mute') != -1) {
        video.muted = true;
        target.classList.remove('mute');
        target.classList.add('unmute');
    } else if (target.className.indexOf('full') != -1) {
        video.parentElement.classList.add('fullscreen');
        target.classList.remove('full');
        target.classList.add('window');
        fullscreenElement = video.parentElement;
        if (fullscreenElement.requestFullscreen)
            fullscreenElement.requestFullscreen();
        else if (fullscreenElement.mozRequestFullScreen)
            fullscreenElement.mozRequestFullScreen();
        else if (fullscreenElement.webkitRequestFullscreen)
            fullscreenElement.webkitRequestFullscreen();
    } else if (target.className.indexOf('window') != -1) {
        exitFullscreen();
    }
}
function play(video) {
    var playbackControl = document.querySelectorAll('a.control.play[data-video="' + video.id + '"]')[0];
    playbackControl.classList.remove('play');
    playbackControl.classList.add('pause');
    video.play();
    document.querySelector('.large.play').classList.add('hidden');
}
function pause(video) {
    var playbackControl = document.querySelectorAll('a.control.pause[data-video="' + video.id + '"]')[0];
    playbackControl.classList.remove('pause');
    playbackControl.classList.add('play');
    video.pause();
}
function addHash(hash) {
    var parts = window.location.hash.substr(1).split(',');
    var newParts = [];
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] === hash)
            return;
        newParts.push(parts[i]);
    }
    newParts.push(hash);
    window.location.hash = '#' + newParts.join(',');
}
function removeHash(hash) {
    var parts = window.location.hash.substr(1).split(',');
    var newParts = [];
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] === hash)
            continue;
        newParts.push(parts[i]);
    }
    window.location.hash = '#' + newParts.join(',');
}
function mediaHashHandler(hash) {
    var parts = hash.split(',');
    // TODO: Be careful not to break this when albums happen
    var video = document.getElementById('video-{{ filename }}');
    var loopControl = document.querySelector('.control.loop');
    var largePlayControl = document.querySelector('.control.play.large');
    var muteControl = document.querySelector('.control.mute');
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] == 'loop') {
            video.loop = true;
            loopControl.classList.add('enabled');
        } else if (parts[i] == 'noloop') {
            video.loop = false;
            loopControl.classList.remove('enabled');
        } else if (parts[i] == 'autoplay') {
            if (!mobile)
                play(video);
        } else if (parts[i] == 'noautoplay') {
            if (!mobile) {
                largePlayControl.classList.remove('hidden');
                pause(video);
            }
        } else if (parts[i] == 'mute') {
            video.muted = true;
            muteControl.classList.add('unmute');
            muteControl.classList.remove('mute');
        }
    }
}
function mediaSizeReporter() {
    var video = document.querySelector('video');
    return { width: video.videoWidth, height: video.videoHeight };
}
function resizeMedia(x, y) {
    document.querySelector('.video').classList.add('fullscreen');
}
