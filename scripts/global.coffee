readCookie = (name) ->
    nameEQ = name + "="
    ca = document.cookie.split(';')
    for c in ca
        while c.charAt(0) == ' '
            c = c.substring(1, c.length)
        if c.indexOf(nameEQ) == 0
            return c.substring(nameEQ.length, c.length)
    return null
window.readCookie = readCookie

createCookie = (name, value, days) ->
    if days
        date = new Date()
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
        expires = "; expires=" + date.toGMTString()
    else
        expires = "; expires=Thu, 01-Jan-1970 00:00:01 GMT"
    document.cookie = name + "=" + value + expires + "; path=/"
window.createCookie = createCookie

dataURItoBlob = (uri) ->
    byteString = atob(uri.split(',')[1])
    mimeString = uri.split(',')[0].split(':')[1].split(':')[0]
    ab = new ArrayBuffer(byteString.length)
    ia = new Uint8Array(ab)
    for i in [0 .. byteString.length]
        ia[i] = byteString.charCodeAt(i)
    return new Blob([ ab ], { type: 'image/png' })
window.dataURItoBlob = dataURItoBlob

adOptOut = (showAlert) ->
    createCookie('ad-opt-out', 1, 3650)
    gad = document.getElementById('gad')
    lgad = document.getElementById('lgad')
    if gad
        gad.innerHTML = "You won't see any ads again. If you regret it, head over to the <a href='/donate'>donation</a> page, where you can opt-in.";
    if lgad
        lgad.innerHTML = "You won't see any ads again. If you regret it, head over to the <a href='/donate'>donation</a> page, where you can opt-in.";
    if showAlert
        alert("You won't see any ads again. If you regret it, head over to the donation page, where you can opt-in.")
window.adOptOut = adOptOut

switchTheme = ->
    if readCookie('dark_theme')
        createCookie('dark_theme', '', -1)
    else
        createCookie('dark_theme', 1, 3650)
    window.location.href = window.location.href
window.switchTheme = switchTheme

confirmCallback = null
window.addEventListener('load', ->
    if document.getElementById('feedback') != null
        feedback = document.getElementById('feedback').querySelector('div')
        feedbackToggle = document.getElementById('toggle-feedback')
        feedbackToggle.addEventListener('click', (e) ->
            e.preventDefault()
            if (feedbackToggle.parentElement.className.indexOf('active') == -1)
                feedbackToggle.parentElement.classList.add('active')
                feedback.querySelector('textarea').focus()
            else
                feedbackToggle.parentElement.classList.remove('active')
        , false) if feedbackToggle

        feedbackSend = document.getElementById('send-feedback')
        feedbackSend.addEventListener('click', (e) ->
            e.preventDefault()
            feedbackText = document.getElementById('feedback-text')
            xhr = new XMLHttpRequest()
            formData = new FormData()

            xhr.open('POST', '/api/feedback')
            formData.append('feedback', feedbackText.value)
            xhr.onload = ->
                result = switch this.status
                    when 200 then "Thanks! We read every one of these. Keep in mind, though, this feedback is anonymous. <a href='mailto:support@mediacru.sh'>Email us</a> if you want a response."
                    when 420 then "Sorry, you can't send more feedback today. Try again in 24 hours!"
                    when 413 then "Sorry, that feedback is too long."
                    else "Sorry, something unexpected happened."
                feedback.innerHTML = "<p>" + result + "</p>"
            xhr.send(formData)
        , false) if feedbackSend
    dialogYes = document.querySelector('.dialog .yes')
    dialogNo = document.querySelector('.dialog .no')
    if dialogYes != null
        dialogYes.addEventListener('click', (e) ->
            e.preventDefault()
            confirmCallback(true) if confirmCallback
            confirmCallback = null
            document.querySelector('.dialog').classList.add('hidden')
        , false)
        dialogNo.addEventListener('click', (e) ->
            e.preventDefault()
            confirmCallback(false) if confirmCallback
            confirmCallback = null
            document.querySelector('.dialog').classList.add('hidden')
        , false)
, false)

confirm = (callback) ->
    confirmCallback = callback
    document.querySelector('.dialog').classList.remove('hidden')
window.confirm = confirm

s4 = -> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)

guid = -> s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
window.guid = guid
