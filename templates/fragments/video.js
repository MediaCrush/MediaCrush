var fullscreenElement;
window.addEventListener('load', function() {
    if (!window.localStorage.volume) {
        window.localStorage.volume = 1;
    }
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
        if (amount)
            amount.style.width = (window.localStorage.volume * 100) + '%';
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
    if (fullscreenElement.cancelFullScreen)
        fullscreenElement.cancelFullScreen();
    else if (fullscreenElement.mozCancelFullScreen)
        fullscreenElement.mozCancelFullScreen();
    else if (fullscreenElement.webkitCancelFullScreen)
        fullscreenElement.webkitCancelFullScreen();
    else if (document.webkitCancelFullScreen)
        document.webkitCancelFullScreen();
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
    var amount = e.layerX / container.clientWidth;
    video.volume = amount;
    window.localStorage.volume = amount;
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
            target.parentElement.removeChild(target);
    } else if (target.className.indexOf('pause') != -1) {
        pause(video);
    } else if (target.className.indexOf('loop') != -1) {
        video.loop = !video.loop;
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
}
function pause(video) {
    var playbackControl = document.querySelectorAll('a.control.pause[data-video="' + video.id + '"]')[0];
    playbackControl.classList.remove('pause');
    playbackControl.classList.add('play');
    video.pause();
}
