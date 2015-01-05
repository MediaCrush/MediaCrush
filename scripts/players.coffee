subtitleRenderers = {}

document.exitFullscreen = document.exitFullscreen ||
                   document.cancelFullScreen ||
                   document.mozCancelFullScreen ||
                   document.webkitExitFullscreen ||
                   document.webkitCancelFullScreen ||
                   document.msExitFullscreen

MediaPlayer = (container) ->
    media = container.querySelector('video, audio')
    id = container.getAttribute('data-media')
    isVideo = media.tagName == 'VIDEO'
    isAudio = media.tagName == 'AUDIO'
    controls = container.querySelector('.controls')
    playPause = container.querySelector('.play-pause')
    startButton = container.querySelector('.start')
    fullscreen = container.querySelector('.fullscreen')
    isFullscreen = false
    toggleLoop = container.querySelector('.loop')
    toggleSubs = container.querySelector('.subtitles')
    rates = container.querySelectorAll('.speeds a')
    seek = container.querySelector('.seek')
    volume = container.querySelector('.volume > div')
    ready = false
    media.controls = false

    if isVideo
        window.mediaSizeReporter = ->
            return { width: media.videoWidth, height: media.videoHeight }
        setTimeout(() ->
            window.updateSize() if window.updateSize?
        , 500)

    updateMedia = ->
        if not ready
            ready = true
            for s in seek.querySelectorAll('.hidden')
                s.classList.remove('hidden')
            seek.querySelector('.progress').classList.add('hidden')
        if window.embedded
            window.updateSize(media.videoWidth, media.videoHeight) if window.updateSize?
        if media.buffered.length == 0
            loaded = 100
        else
            loaded = media.buffered.end(media.buffered.length - 1) / media.duration * 100
        seek.querySelector('.loaded').style.width = loaded + '%'
        seek.querySelector('.played').style.width = media.currentTime / media.duration * 100 + '%'
        if media.ended and startButton?
            startButton.classList.remove('hidden')
        if media.paused
            controls.classList.add('fixed') if isVideo
            playPause.classList.remove('pause')
            playPause.classList.add('play')
        else
            controls.classList.remove('fixed') if isVideo
            playPause.classList.remove('play')
            playPause.classList.add('pause')
            if startButton?
                startButton.classList.add('hidden')
    updateMedia()

    media.addEventListener(event, (e) ->
        if media.readyState >= 3 or ready # HAVE_FUTURE_DATA (we can play now)
            updateMedia()
    , false) for event in ['progress', 'timeupdate', 'pause', 'playing', 'seeked', 'ended', 'loadedmetadata']

    if toggleSubs
        toggleSubs.addEventListener('click', (e) ->
            e.preventDefault()
            if container.className.indexOf('subs-off') == -1
                if subtitleRenderers[id]?
                    subtitleRenderers[id].disableSubs()
                container.classList.add('subs-off')
                toggleSubs.querySelector('.icon').classList.add('disabled')
                toggleSubs.querySelector('.text').textContent = 'Subtitles OFF'
            else
                if subtitleRenderers[id]?
                    subtitleRenderers[id].enableSubs()
                container.classList.remove('subs-off')
                toggleSubs.querySelector('.icon').classList.remove('disabled')
                toggleSubs.querySelector('.text').textContent = 'Subtitles ON'
        , false)

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
            if isVideo
                height = volume.querySelector('.background').clientHeight
                if e.offsetY?
                    amount = (height - e.offsetY) / height
                else
                    amount = (height - e.layerY) / height
                volume.querySelector('.amount').style.height = amount * 100 + '%'
            else
                width = volume.querySelector('.background').clientWidth
                if e.offsetX?
                    amount = e.offsetX / width
                else
                    amount = e.layerX / width
                volume.querySelector('.amount').style.width = amount * 100 + '%'
            media.volume = amount
            try
                window.localStorage.volume = amount
            catch ex
                # This doesn't work in iframes, and catching it prevents everything from breaking
        endAdjustVolume = (e) ->
            e.preventDefault()
            adjustingVolume = false

        try
            if window.localStorage.volume?
                media.volume = window.localStorage.volume
                if isVideo
                    volume.querySelector('.amount').style.height = window.localStorage.volume * 100 + '%'
                else
                    volume.querySelector('.amount').style.width = window.localStorage.volume * 100 + '%'
        catch ex
            # This doesn't work in iframes, and catching it prevents everything from breaking

        volumeClick = volume.querySelector('.clickable')
        volumeClick.addEventListener('mousedown', beginAdjustVolume, false)
        volumeClick.addEventListener('mouseup', endAdjustVolume, false)
        volumeClick.addEventListener('mousemove', adjustVolumeProgress, false)
        volumeClick.addEventListener('mouseleave', endAdjustVolume, false)

    if isVideo
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

    if fullscreen != null
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
                window.setTimeout(() ->
                    subtitleRenderers[id].resize(media.offsetWidth, media.offsetHeight) if subtitleRenderers[id]?
                , 100)
                timeout = setTimeout(idleUI, 3000)
            else
                leaveFullscreen()
        , false)

        leaveFullscreen = ->
            isFullscreen = false
            container.classList.remove('fullscreen')
            fullscreen.classList.remove('disabled')
            document.exitFullscreen()
            # Chrome hack to fix positioning when leaving full screen
            _ = document.querySelector('.media')
            _.style.right = 0 if _
            window.setTimeout(() ->
                _.style.right = '-50%' if _
                if subtitleRenderers[id]?
                    subtitleRenderers[id].resize(media.offsetWidth, media.offsetHeight)
            , 200)

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
    
    window.resizeMedia = (width, height) ->
        return if not isVideo
        return if not ready
        media.width = width
        media.height = height - 5
        if subtitleRenderers[id]?
            subtitleRenderers[id].resize(media.offsetWidth, media.offsetHeight)
window.MediaPlayer = MediaPlayer

document.addEventListener('DOMContentLoaded', () ->
    for player in document.querySelectorAll('.player.subtitled')
        ((player) ->
            id = player.getAttribute('data-media')
            video = player.querySelector('video')
            track = video.querySelector('track')
            format = track.dataset.format
            if format == 'ass'
                style = document.getElementById('font-map-' + id)
                ass = null

                handleSubsReady = (video, ass) ->
                    if video.readyState >= HTMLMediaElement.HAVE_METADATA and ass
                        width = video.offsetWidth
                        height = video.offsetHeight
                        renderer = new libjass.renderers.DefaultRenderer(video, ass, {
                            fontMap: libjass.renderers.RendererSettings.makeFontMapFromStyleElement(style)
                        })
                        renderer.resize(width, height)
                        subtitleRenderers[id] = {
                            resize: () ->
                                renderer.resize.apply(renderer, arguments)
                            disableSubs: () ->
                                renderer.disable()
                            enableSubs: () ->
                                renderer.enable()
                        }
                        renderer.disable() if video.parentElement.classList.contains('subs-off')

                if video.readyState < HTMLMediaElement.HAVE_METADATA
                    video.addEventListener('loadedmetadata', () ->
                        handleSubsReady(video, ass)
                    , false)
                else
                    handleSubsReady(video, ass)
                request = new XMLHttpRequest()
                request.open('GET', track.src || track.getAttribute('src'))
                request.onload = () ->
                    ass = libjass.ASS.fromString(this.responseText)
                    handleSubsReady(video, ass)
                request.send()
            if format == 'vtt'
                captionator.captionify(video, "en", {})
                subtitleRenderers[id] = {
                    resize: () ->
                        # nop
                    disableSubs: () ->
                        video.textTracks[0].mode = 'hidden'
                    enableSubs: () ->
                        video.textTracks[0].mode = 'showing'
                }
                video.textTracks[0].mode = 'hidden' if video.parentElement.classList.contains('subs-off')
        )(player)
, false)
 
document.addEventListener "keypress", ((e) ->
  key = (if not window.event? then e.which else window.event.keyCode)
  if key is 32
    video = document.getElementsByTagName("video")[0]
    if video
      e.preventDefault()
      if video.paused
        video.play()
      else
        video.pause()
), true
