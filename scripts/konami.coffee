keys = []
window.addEventListener('keydown', (e) ->
    keys.push(e.keyCode)
    done = false
    if keys.length >= 10
        keys.splice(0, 1)
    if not done and keys.join(',') == '38,40,40,37,39,37,39,66,65'
        done = true
        audio = document.createElement('audio')
        audio.src = '/static/konami.mp3'
        audio.autoplay = true
        audio.loop = true
        if window.localStorage.volume?
            audio.volume = window.localStorage.volume
        document.body.appendChild(audio)
        item.classList.remove('hidden') for item in document.querySelectorAll('.konami')
        document.body.classList.add('konami')
        document.querySelector('.brand img').src = '/static/konami-brand.svg'
        document.querySelector('#blurb').classList.add('hidden')
        document.querySelector('#types').classList.add('hidden')
, false)
