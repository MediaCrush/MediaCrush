VideoPlayer = (container) ->
    video = container.querySelector('video')
    playPause = container.querySelector('.play-pause')
    fullscreen = container.querySelector('.fullscreen')
    toggleLoop = container.querySelector('.loop')

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
window.VideoPlayer = VideoPlayer
