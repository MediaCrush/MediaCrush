window.addEventListener('DOMContentLoaded', () ->
    link.addEventListener('click', (e) ->
        e.preventDefault()
        document.querySelector('.nav li.selected').classList.remove('selected')
        e.target.parentElement.classList.add('selected')

        target = e.target.hash.substr(1)

        h2.classList.add('hidden') for h2 in document.querySelectorAll('.intro h2')
        document.getElementById("#{target}-intro").classList.remove('hidden')

        div.classList.add('hidden') for div in document.querySelectorAll('.pill-content > div')
        document.getElementById(target).classList.remove('hidden')
    , false) for link in document.querySelectorAll('.nav a')
, false)
