var fullscreenElement;
window.addEventListener('load', function() {
    try {
        if (!window.localStorage.volume) {
            window.localStorage.volume = 1;
        }
    } catch (ex) { /* this causes security exceptions in sandboxed iframes */ }
    var controls = document.querySelectorAll('.video .control');
    for (var i = 0; i < controls.length; i++) {
        controls[i].addEventListener('click', video_controlClick, false);
    }
    var videos = document.querySelectorAll('video');
    for (var i = 0; i < videos.length; i++) {
        videos[i].addEventListener('ended', function(e) {
            if (!e.target.loop) {
                video_pause(e.target);
            }
        }, true);
        videos[i].addEventListener('progress', updateVideo, false);
        if (videos[i].readyState > 0) {
            updateVideo({ target: videos[i] });
        }
        videos[i].addEventListener('timeupdate', updateVideo, false);
        if (window.flags) {
            if (window.flags.mute) {
                videos[i].muted = true;
                // Note: this probably won't work in the subtitles branch
                var muteControl = videos[i].parentElement.querySelector('.control.mute');
                muteControl.classList.add('unmute');
                muteControl.classList.remove('mute');
            }
        }
    }
    var hovers = document.querySelectorAll('.video .hover');
    for (var i = 0; i < hovers.length; i++) {
        hovers[i].addEventListener('mousemove', videoMouseMove, false);
    }
    var buffers = document.querySelectorAll('.video .seek .buffering, .video .seek .progress, .video .seek .unbuffered');
    for (var i = 0; i < buffers.length; i++) {
        buffers[i].addEventListener('click', handleSeek, false);
    }
    var volumes = document.querySelectorAll('.video .volume, .video .volume .amount');
    for (var i = 0; i < volumes.length; i++) {
        var amount = volumes[i].querySelector('.amount');
        try {
            if (amount)
                amount.style.width = (window.localStorage.volume * 100) + '%';
        } catch (ex) {
            amount.style.width = '100%';
        }
        volumes[i].addEventListener('mousedown', video_beginAdjustVolume, false);
        volumes[i].addEventListener('mousemove', video_adjustVolume, false);
        volumes[i].addEventListener('mouseup', video_endAdjustVolume, false);
        volumes[i].addEventListener('mouseleave', video_endAdjustVolume, false);
    }
    document.addEventListener('mozfullscreenchange', function() {
        if (document.mozFullScreenElement === null) {
            exitFullscreen();
        }
    }, false);
    document.addEventListener('webkitfullscreenchange', function() {
        if (document.webkitFullScreenElement === null) {
            exitFullscreen();
        }
    }, false);
    document.addEventListener('fullscreenchange', function() {
        if (document.fullScreenElement === null) {
            exitFullscreen();
        }
    }, false);
    window.addEventListener('keyup', function(e) {
        if (e.keyCode == 27 && fullscreenElement !== null) // esc
            exitFullscreen();
    }, false);
}, false);
function videoMouseMove(e) {
    return; // TODO: Fix this
    var hover = e.target;
    while (hover.className.indexOf('video') == -1)
        hover = hover.parentElement;
    hover = hover.querySelector('.hover');
    if (hover.className.indexOf('disabled') != -1) {
        hover.classList.remove('disabled');
        hover.setAttribute('data-debounce', false);
    }
    setTimeout(function() {
        if (hover.getAttribute('data-debounce') == 'true') {
            return;
        }
        hover.setAttribute('data-debounce', true);
        hover.classList.add('disabled');
    }, 2000);
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
    var target = fullscreenElement.querySelector('.window');
    target.classList.remove('window');
    target.classList.add('full');
    fullscreenElement = null;
    // Chrome hack to force layout recalculation (fixes weird bug when exiting fullscreen)
    var media = document.querySelector('.media');
    media.style.right = 0;
    setTimeout(function() {
        media.style.right = '-50%';
    }, 100);
}
function video_beginAdjustVolume(e) {
    e.preventDefault();
    var container = e.target;
    if (e.target.className.indexOf('volume') == -1)
        container = e.target.parentElement;
    container.classList.add('action');
    video_adjustVolume(e);
}
function video_endAdjustVolume(e) {
    var container = e.target;
    if (e.target.className.indexOf('volume') == -1)
        container = e.target.parentElement;
    container.classList.remove('action');
}
function video_adjustVolume(e) {
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
function video_controlClick(e) {
    e.preventDefault();
    var target = e.target;
    if (!target.className)
        target = target.parentElement;
    var video = document.getElementById(target.getAttribute('data-video'));
    if (target.className.indexOf('play') != -1) {
        video_play(video);
        if (target.className.indexOf('large') != -1)
            target.classList.add('hidden');
    } else if (target.className.indexOf('pause') != -1) {
        video_pause(video);
    } else if (target.className.indexOf('loop') != -1) {
        video.loop = !video.loop;
        if (video.ended) {
            video.currentTime = 0;
            video_play(video);
        } else if (video.paused) {
            video_play(video);
        }
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
function video_play(video) {
    var playbackControl = document.querySelectorAll('a.control.play[data-video="' + video.id + '"]')[0];
    playbackControl.classList.remove('play');
    playbackControl.classList.add('pause');
    video.play();
    document.querySelector('[data-video="' + video.id + '"] .large.play').classList.add('hidden');
}
function video_pause(video) {
    var playbackControl = document.querySelectorAll('a.control.pause[data-video="' + video.id + '"]')[0];
    playbackControl.classList.remove('pause');
    playbackControl.classList.add('play');
    video.pause();
}
function playMedia() {
    var video = document.querySelectorAll('video');
    for (var i = 0; i < video.length; i++) {
        video_play(video[i]);
    }
}
function pauseMedia() {
    var video = document.querySelectorAll('video');
    for (var i = 0; i < video.length; i++) {
        video_pause(video[i]);
    }
}
function mediaHashHandler(hash) {
    if (window.album) return;
    var parts = hash.split(',');
    var video = document.getElementById('video-' + window.filename);
    var loopControl = document.querySelector('.video .control.loop');
    var largePlayControl = document.querySelector('.video .control.play.large');
    var muteControl = document.querySelector('.video .control.mute');
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] == 'loop') {
            video.loop = true;
            loopControl.classList.add('enabled');
        } else if (parts[i] == 'noloop') {
            video.loop = false;
            loopControl.classList.remove('enabled');
        } else if (parts[i] == 'autoplay') {
            if (!mobile)
                video_play(video);
        } else if (parts[i] == 'noautoplay') {
            if (!mobile) {
                largePlayControl.classList.remove('hidden');
                video_pause(video);
            }
        } else if (parts[i] == 'mute') {
            video.muted = true;
            muteControl.classList.add('unmute');
            muteControl.classList.remove('mute');
        } else if (parts[i] == 'nobrand') {
            video.parentElement.classList.add('nobrand');
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
