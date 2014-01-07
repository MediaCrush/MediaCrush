window.addEventListener('load', ->
    cookie = readCookie('do-not-send')
    blacklist = []
    if cookie
        blacklist = JSON.parse(cookie)
        for item in blacklist
            document.querySelector("input[data-type='#{item}']").checked = true
    inputs = document.querySelectorAll('input')
    warning = document.getElementById('warning')
    for input in inputs
        input.addEventListener('change', (e) ->
            mimetype = e.target.getAttribute('data-type')
            if e.target.checked and not blacklist.contains(mimetype)
                blacklist.push(mimetype)
                createCookie('do-not-send', JSON.stringify(blacklist), 3650)
                if blacklist.length == 3
                    warning.classList.remove('hidden')
            else if not e.target.checked and blacklist.contains(mimetype)
                for i in [0...blacklist.length]
                    if blacklist[i] == mimetype
                        blacklist.remove(i)
                        break
                createCookie('do-not-send', JSON.stringify(blacklist), 3650)
                if blacklist.length != 3
                    warning.classList.add('hidden')
        , false)
, false)
