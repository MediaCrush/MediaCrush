VideoPlayer = (container) ->
    video = container.querySelector('video')
    playPause = container.querySelector('.play-pause')
    fullscreen = container.querySelector('.fullscreen')
    toggleLoop = container.querySelector('.loop')
    rates = container.querySelectorAll('.speeds a')

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
