window.addEventListener('DOMContentLoaded', () ->
    input.addEventListener('mouseenter', (e) ->
        e.target.focus()
        e.target.select()
    ) for input in document.querySelectorAll('input.selectall')
    document.getElementById('embed-link').addEventListener('click', (e) ->
        e.preventDefault()
        embed = document.getElementById('embed')
        if (embed.className == 'hidden')
            embed.className = ''
        else
            embed.className = 'hidden'
    )
    report = document.getElementById('report')
    report.addEventListener('click', (e) ->
        e.preventDefault()
        report = document.getElementById('report')
        xhr = new XMLHttpRequest()
        xhr.open('GET', '/report/' + location.href.split('/')[3])
        xhr.send()
        report.parentElement.innerHTML = "Reported"
    , false)
, false)
