window.addEventListener('load', function() {
    if (!window.localStorage.volume) {
        window.localStorage.volume = 1;
    }
    var controls = document.querySelectorAll('.audio .control');
    for (var i = 0; i < controls.length; i++) {
        controls[i].addEventListener('click', controlClick, false);
    }
    var audioElements = document.querySelectorAll('audio');
    for (var i = 0; i < audioElements.length; i++) {
        audioElements[i].addEventListener('ended', function(e) {
            if (!e.target.loop) {
                pause(e.target);
            }
        }, true);
        audioElements[i].addEventListener('progress', updateAudio, false);
        if (audioElements[i].readyState > 0) {
            updateAudio({ target: audioElements[i] });
        }
        audioElements[i].addEventListener('timeupdate', updateAudio, false);
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
}, false);
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
    var audio = document.getElementById(container.getAttribute('data-audio'));
    var amount = e.layerX / container.clientWidth;
    audio.volume = amount;
    window.localStorage.volume = amount;
    container.querySelector('.amount').style.width = (amount * 100) + '%';
}
function handleSeek(e) {
    e.preventDefault();
    var container = e.target.parentElement;
    var audio = document.getElementById(container.getAttribute('data-audio'));
    var seek = audio.duration * (e.layerX / container.clientWidth);
    audio.currentTime = seek;
}
function updateAudio(e) {
    var audio = e.target;
    var buffer = document.querySelectorAll('.seek[data-audio="' + audio.id + '"] .buffering')[0];
    var progress = document.querySelectorAll('.seek[data-audio="' + audio.id + '"] .progress')[0];
    var indicator = document.querySelectorAll('.seek[data-audio="' + audio.id + '"] .indicator')[0];
    var time = document.querySelectorAll('.time[data-audio="' + audio.id + '"]')[0];
    var bufferWidth;
    if (audio.buffered.length == 0)
        bufferWidth = 100;
    else
        bufferWidth = audio.buffered.end(audio.buffered.length - 1) / audio.duration * 100;
    if (bufferWidth > 100)
        bufferWidth = 100;
    buffer.style.width = bufferWidth + '%';
    progress.style.width = indicator.style.left = audio.currentTime / audio.duration * 100 + '%';
    var minutes = Math.floor(audio.currentTime / 60);
    var seconds = Math.floor(audio.currentTime % 60);
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
    var audio = document.getElementById(target.getAttribute('data-audio'));
    if (target.className.indexOf('play') != -1) {
        play(audio);
        if (target.className.indexOf('large') != -1)
            target.parentElement.removeChild(target);
    } else if (target.className.indexOf('pause') != -1) {
        pause(audio);
    } else if (target.className.indexOf('loop') != -1) {
        audio.loop = !audio.loop;
        if (audio.paused)
            play(audio);
        if (target.className.indexOf('enabled') != -1)
            target.classList.remove('enabled');
        else
            target.classList.add('enabled');
    } else if (target.className.indexOf('unmute') != -1) {
        audio.muted = false;
        target.classList.remove('unmute');
        target.classList.add('mute');
    } else if (target.className.indexOf('mute') != -1) {
        audio.muted = true;
        target.classList.remove('mute');
        target.classList.add('unmute');
    }
}
function play(audio) {
    var playbackControl = document.querySelectorAll('a.control.play[data-audio="' + audio.id + '"]')[0];
    playbackControl.classList.remove('play');
    playbackControl.classList.add('pause');
    audio.play();
}
function pause(audio) {
    var playbackControl = document.querySelectorAll('a.control.pause[data-audio="' + audio.id + '"]')[0];
    playbackControl.classList.remove('pause');
    playbackControl.classList.add('play');
    audio.pause();
}
