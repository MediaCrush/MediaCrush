window.updateSize = () ->
    if window.mediaSizeReporter?
        size = mediaSizeReporter()
        size.height += 5
        embed = document.getElementById('embed-value')
        embed.value = '<iframe src="' + window.location.href + '/frame" frameborder="0" allowFullscreen width="' + size.width + '" height="' + size.height + '"></iframe>'

window.addEventListener('DOMContentLoaded', ->
    inputs = document.querySelectorAll('input.selectall')
    input.addEventListener('mouseenter', (e) ->
        e.target.focus()
        e.target.select()
    , false) for input in inputs

    document.getElementById('share-link').addEventListener('click', (e) ->
        e.preventDefault()
        share = document.getElementById('share')
        embed = document.getElementById('embed')
        if share.classList.contains('hidden')
            share.classList.remove('hidden')
            embed.classList.add('hidden')
        else
            share.classList.add('hidden')
    , false)

    document.getElementById('embed-link').addEventListener('click', (e) ->
        e.preventDefault()
        share = document.getElementById('share')
        embed = document.getElementById('embed')
        if embed.classList.contains('hidden')
            embed.classList.remove('hidden')
            share.classList.add('hidden')
        else
            embed.classList.add('hidden')
    , false)

    document.getElementById('delete').addEventListener('click', (e) ->
        e.preventDefault()
        confirm((a) ->
            return if not a
            API.deleteFile(window.filename)
            document.getElementById('delete').parentElement.innerHTML = 'Deleted'
        )
    , false)

    report = document.getElementById('report')
    report.addEventListener('click', (e) ->
        e.preventDefault()
        confirm((a) ->
            return if not a
            API.reportFile(window.filename)
            report.parentElement.innerHTML = 'Reported'
        )
    , false)

    if window.location.hash == '#fromExtension'
        window.history.pushState("", document.title, window.location.pathname)
        UserHistory.add(window.filename)

    window.updateSize() if window.updateSize?

    canDelete = window.can_delete == 'True'
    if window.can_delete == 'check'
        history = UserHistory.getHistory()
        if history
            hashIndex = null
            for i in [0...history.length]
                if history[i] == window.filename
                    canDelete = true
                    hashIndex = i
                    break
    if canDelete
        document.getElementById('delete').parentElement.classList.remove('hidden')
        flags = document.getElementById('flags')
        if flags
            flags.classList.remove('hidden')
            checkboxes = flags.querySelectorAll('input')
            for box in checkboxes
                ((box) ->
                    box.addEventListener('change', (e) ->
                        flag = box.getAttribute('data-flag')
                        window.flags[flag] = !window.flags[flag]
                        API.setFlags(window.filename, window.flags)
                        updateFlag(flag, window.flags[flag])
                    )
                )(box)
, false)
