document.cancelFullScreen = document.cancelFullScreen ||
                   document.mozCancelFullScreen ||
                   document.webkitCancelFullScreen ||
                   document.msExitFullscreen # Thanks for that last one, Microsoft, well done

MediaPlayer = (container) ->
    media = container.querySelector('video, audio')
    isVideo = media.tagName == 'VIDEO'
    isAudio = media.tagName == 'AUDIO'
    controls = container.querySelector('.controls')
    playPause = container.querySelector('.play-pause')
    startButton = container.querySelector('.start')
    fullscreen = container.querySelector('.fullscreen')
    isFullscreen = false
    toggleLoop = container.querySelector('.loop')
    rates = container.querySelectorAll('.speeds a')
    seek = container.querySelector('.seek')
    volume = container.querySelector('.volume > div')
    ready = false

    updateMedia = ->
        if not ready
            ready = true
            for s in seek.querySelectorAll('.hidden')
                s.classList.remove('hidden')
            seek.querySelector('.progress').classList.add('hidden')
        if media.buffered.length == 0
            loaded = 100
        else
            loaded = media.buffered.end(media.buffered.length - 1) / media.duration * 100
        seek.querySelector('.loaded').style.width = loaded + '%'
        seek.querySelector('.played').style.width = media.currentTime / media.duration * 100 + '%'
        if media.paused
            controls.classList.add('fixed')
            playPause.classList.remove('pause')
            playPause.classList.add('play')
        else
            controls.classList.remove('fixed')
            playPause.classList.remove('play')
            playPause.classList.add('pause')
            if startButton?
                startButton.parentElement.removeChild(startButton) if startButton.parentElement?
    updateMedia()

    media.addEventListener(event, (e) ->
        if media.readyState > 0
            updateMedia()
    , false) for event in ['progress', 'timeupdate', 'pause', 'playing', 'seeked', 'ended']

    if volume != null
        volumeIcon = volume.parentElement.querySelector('.icon')
        volumeIcon.addEventListener('click', (e) ->
            e.preventDefault()
            media.muted = !media.muted
        , false)
        media.addEventListener('volumechange', (e) ->
            # Adjust volume accordingly
            if media.muted
                volume.parentElement.classList.add('muted')
                volumeIcon.setAttribute('data-icon', '\uF038')
            else
                volume.parentElement.classList.remove('muted')
                if media.volume > 0.66
                    iconSymbol = '\uF03B'
                else if 0.33 < media.volume <= 0.66
                    iconSymbol = '\uF03A'
                else
                    iconSymbol = '\uF039'
                volumeIcon.setAttribute('data-icon', iconSymbol)
        , false)

        adjustingVolume = false
        beginAdjustVolume = (e) ->
            e.preventDefault()
            adjustingVolume = true
            adjustVolumeProgress(e)
        adjustVolumeProgress = (e) ->
            e.preventDefault()
            return if not adjustingVolume
            height = volume.querySelector('.background').clientHeight
            if e.offsetY?
                amount = (height - e.offsetY) / height
            else
                amount = (height - e.layerY) / height
            media.volume = amount
            volume.querySelector('.amount').style.height = amount * 100 + '%'
            try
                window.localStorage.volume = amount
            catch ex
                # This doesn't work in iframes, and catching it prevents everything from breaking
        endAdjustVolume = (e) ->
            e.preventDefault()
            adjustingVolume = false

        try
            media.volume = window.localStorage.volume
            volume.querySelector('.amount').style.height = window.localStorage.volume * 100 + '%'
        catch ex
            # This doesn't work in iframes, and catching it prevents everything from breaking

        volumeClick = volume.querySelector('.clickable')
        volumeClick.addEventListener('mousedown', beginAdjustVolume, false)
        volumeClick.addEventListener('mouseup', endAdjustVolume, false)
        volumeClick.addEventListener('mousemove', adjustVolumeProgress, false)
        volumeClick.addEventListener('mouseleave', endAdjustVolume, false)

    idleDebounce = false
    idleUI = ->
        idleDebounce = true
        controls.classList.add('idle')
        media.classList.add('idle')
    timeout = null
    idleEvent = (e) ->
        if idleDebounce
            idleDebounce = false
            return false
        clearTimeout(timeout)
        controls.classList.remove('idle')
        media.classList.remove('idle')
        return true
    media.addEventListener('mousemove', (e) ->
        if idleEvent(e)
            timeout = setTimeout(idleUI, 3000)
    , false)
    controls.addEventListener('mousemove', idleEvent, false)

    seeking = false
    wasPaused = true
    beginSeek = (e) ->
        e.preventDefault()
        seeking = true
        wasPaused = media.paused
        media.pause()
        seekProgress(e)
    seekProgress = (e) ->
        e.preventDefault()
        return if not seeking
        if e.offsetX?
            amount = e.offsetX / seek.clientWidth
        else
            amount = e.layerX / seek.clientWidth
        media.currentTime = media.duration * amount
    endSeek = (e) ->
        e.preventDefault()
        return if not seeking
        media.play() if not wasPaused
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
            timeout = setTimeout(idleUI, 3000)
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
        if media.paused
            media.play()
        else
            media.pause()
    , false)

    if startButton?
        startButton.addEventListener('click', (e) ->
            e.preventDefault()
            media.play()
        , false)

    toggleLoop.addEventListener('click', (e) ->
        e.preventDefault()
        if media.loop
            media.loop = false
            toggleLoop.querySelector('.icon').classList.add('disabled')
            toggleLoop.querySelector('.text').textContent = 'Loop OFF'
        else
            media.loop = true
            toggleLoop.querySelector('.icon').classList.remove('disabled')
            toggleLoop.querySelector('.text').textContent = 'Loop ON'
            if media.ended
                media.currentTime = 0
                media.play()
    , false)

    for rate in rates
        rate.addEventListener('click', (e) ->
            e.preventDefault()
            speed = parseFloat(e.target.getAttribute('data-speed'))
            container.querySelector('.speeds a.selected').classList.remove('selected')
            e.target.classList.add('selected')
            media.playbackRate = speed
        , false)
window.MediaPlayer = MediaPlayer
