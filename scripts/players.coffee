document.cancelFullScreen = document.cancelFullScreen ||
                   document.mozCancelFullScreen ||
                   document.webkitCancelFullScreen ||
                   document.msExitFullscreen # Thanks for that last one, Microsoft, well done

VideoPlayer = (container) ->
    video = container.querySelector('video')
    playPause = container.querySelector('.play-pause')
    fullscreen = container.querySelector('.fullscreen')
    isFullscreen = false
    toggleLoop = container.querySelector('.loop')
    rates = container.querySelectorAll('.speeds a')
    seek = container.querySelector('.seek')
    ready = false

    updateVideo = ->
        if not ready
            ready = true
            for s in seek.querySelectorAll('.hidden')
                s.classList.remove('hidden')
            seek.querySelector('.progress').classList.add('hidden')
        if video.buffered.length == 0
            loaded = 100
        else
            loaded = video.buffered.end(video.buffered.length - 1) / video.duration * 100
        seek.querySelector('.loaded').style.width = loaded + '%'
        seek.querySelector('.played').style.width = video.currentTime / video.duration * 100 + '%'
    updateVideo()

    video.addEventListener(event, (e) ->
        if video.readyState > 0
            updateVideo()
    , false) for event in ['progress', 'timeupdate', 'pause', 'playing', 'seeked', 'ended']

    seeking = false
    beginSeek = (e) ->
        e.preventDefault()
        seeking = true
        video.pause()
        seekProgress(e)
    seekProgress = (e) ->
        e.preventDefault()
        return if not seeking
        if e.offsetX?
            amount = e.offsetX / seek.clientWidth
        else
            amount = e.layerX / seek.clientWidth
        video.currentTime = video.duration * amount
    endSeek = (e) ->
        e.preventDefault()
        video.play()
        seeking = false

    seekClick = seek.querySelector('.clickable')
    seekClick.addEventListener('mousedown', beginSeek, false)
    seekClick.addEventListener('mouseup', endSeek, false)
    seekClick.addEventListener('mousemove', seekProgress, false)
    seekClick.addEventListener('mouseleave', endSeek, false)

    debounce = true
    document.addEventListener(prefix + 'fullscreenchange', (e) ->
        if debounce
            debounce = false
            return
        debounce = true
        leaveFullscreen() if isFullscreen
    , false) for prefix in ['', 'moz', 'webkit', 'ms']
    fullscreen.addEventListener('click', (e) ->
        e.preventDefault()
        if not isFullscreen
            isFullscreen = true
            fullscreen.classList.add('disabled')
            container.requestFullScreen() if container.requestFullScreen?
            container.mozRequestFullScreen() if container.mozRequestFullScreen?
            container.webkitRequestFullScreen() if container.webkitRequestFullScreen?
            container.msRequestFullscreen() if container.msRequestFullscreen?
            container.classList.add('fullscreen')
        else
            leaveFullscreen()
    , false)

    leaveFullscreen = ->
        isFullscreen = false
        container.classList.remove('fullscreen')
        fullscreen.classList.remove('disabled')
        document.cancelFullScreen()
        # Chrome hack to fix positioning when leaving full screen
        media = document.querySelector('.media')
        media.style.right = 0
        window.setTimeout(->
            media.style.right = '-50%'
        , 100)

    playPause.addEventListener('click', (e) ->
        e.preventDefault()
        if video.paused
            video.play()
            playPause.classList.remove('play')
            playPause.classList.add('pause')
        else
            video.pause()
            playPause.classList.remove('pause')
            playPause.classList.add('play')
    , false)

    toggleLoop.addEventListener('click', (e) ->
        e.preventDefault()
        if video.loop
            video.loop = false
            toggleLoop.querySelector('.icon').classList.add('disabled')
            toggleLoop.querySelector('.text').textContent = 'Loop OFF'
        else
            video.loop = true
            toggleLoop.querySelector('.icon').classList.remove('disabled')
            toggleLoop.querySelector('.text').textContent = 'Loop ON'
            if video.ended
                video.currentTime = 0
                video.play()
    , false)

    for rate in rates
        rate.addEventListener('click', (e) ->
            e.preventDefault()
            speed = parseFloat(e.target.getAttribute('data-speed'))
            container.querySelector('.speeds a.selected').classList.remove('selected')
            e.target.classList.add('selected')
            video.playbackRate = speed
        , false)
window.VideoPlayer = VideoPlayer
