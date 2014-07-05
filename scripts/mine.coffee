detailedHistory = {}
itemsToLoad = []
itemsPerPage = 10
paginationLimit = 4

window.addEventListener('DOMContentLoaded', ->
    historyEnabled = document.getElementById('history-toggle')
    disabledText = document.getElementById('disabledText')
    if not UserHistory.getHistoryEnabled()
        disabledText.classList.remove('hidden')
        historyEnabled.textContent = 'enable local history'
    historyEnabled.addEventListener('click', (e) ->
        e.preventDefault()
        if UserHistory.toggleHistoryEnabled()
            disabledText.classList.add('hidden')
            historyEnabled.textContent = 'disable local history'
        else
            disabledText.classList.remove('hidden')
            historyEnabled.textContent = 'enable local history'
    , false)
    document.getElementById('forget-all').addEventListener('click', (e) ->
        e.preventDefault()
        confirm((a) ->
            return if not a
            UserHistory.clear()
            window.location = '/mine'
        )
    , false)
    loadCurrentPage()
    window.onhashchange = ->
        window.scrollTo(0, 0)
        loadCurrentPage()
, false)

loadCurrentPage = ->
    # TODO: When things are forgotten/deleted, don't reload the whole page for it
    document.getElementById('progress').classList.remove('hidden')
    createPagination()
    container = document.getElementById('items')
    container.removeChild(container.lastChild) while container.hasChildNodes()

    page = getCurrentPage()
    itemsToLoad = []
    reversedHistory = UserHistory.getHistory()[..].reverse()
    first = page * itemsPerPage
    last = page * itemsPerPage + itemsPerPage
    last = reversedHistory.length if last > reversedHistory.length
    itemsToLoad = reversedHistory[first...last]

    itemsToFetch = (i for i in itemsToLoad when not detailedHistory[i]?)
    if itemsToFetch.length > 0
        UserHistory.loadDetailedHistory(itemsToFetch, (result) ->
            detailedHistory[k] = v for k, v of result
            itemsToLoad = (detailedHistory[k] or k for k in itemsToLoad)
            loadPage(itemsToLoad)
            document.getElementById('progress').classList.add('hidden')
        )
    else
        itemsToLoad = (detailedHistory[k] for k in itemsToLoad)
        loadPage(itemsToLoad)
        document.getElementById('progress').classList.add('hidden')

loadPage = (items) ->
    container = document.getElementById('items')
    container.appendChild(createView(item)) for item in items

createMissing = (item, container) ->
    container.id = item
    container.className = 'missing-item'
    text = document.createElement('div')
    text.textContent = 'This item no longer exists.'
    container.appendChild(text)
    forget = document.createElement('a')
    forget.textContent = 'Remove from history'
    forget.href = '/forget/' + item
    ((item) ->
        forget.addEventListener('click', (e) ->
            e.preventDefault()
            confirm((a) ->
                return if not a
                UserHistory.remove(item)
                container.parentElement.removeChild(container)
                loadCurrentPage()
            )
        , false)
    )(item)
    container.appendChild(forget)
    return container

createView = (item, noLink = false) ->
    container = document.createElement('div')
    if not item.hash
        return createMissing(item, container)
    else
        preview = null
        if item.blob_type == 'video'
            preview = document.createElement('video')
            if item.extras? and item.extras.length > 0
                preview.poster = item.extras[0].url
            preview.loop = true
            for file in item.files
                continue if file.type == 'image/gif'
                source = document.createElement('source')
                source.src = window.cdn + file.file
                source.type = file.type
                preview.appendChild(source)
            preview.volume = 0
            preview.onmouseenter = (e) ->
                e.target.play()
            preview.onmouseleave = (e) ->
                e.target.pause()
        else if item.blob_type == 'image'
            preview = document.createElement('img')
            preview.src = window.cdn + item.files[0].file
        else if item.blob_type == 'audio'
            preview = document.createElement('img')
            preview.src = '/static/audio-player.png'
            preview.style.marginTop = '23px'
        else if item.type == 'application/album'
            preview = document.createElement('div')
            preview.className = 'album-preview'
            for file in item.files[..3]
                preview.appendChild(createView(file, true))
        return createMissing(item, container) if not preview?
        preview.classList.add('item')
        if not noLink
            outerContainer = document.createElement('div')
            bar = document.createElement('div')
            bar.className = 'bar'

            forgetLink = document.createElement('a')
            forgetLink.textContent = 'Forget'
            forgetLink.className = 'left'
            forgetLink.href = '/forget/' + item.hash
            forgetLink.addEventListener('click', (e) ->
                e.preventDefault()
                confirm((a) ->
                    return if not a
                    UserHistory.remove(item.hash)
                    container.parentElement.removeChild(container)
                    loadCurrentPage()
                )
            , false)
            forgetLink.title = 'Remove this item from your history'
            bar.appendChild(forgetLink)

            deleteLink = document.createElement('a')
            deleteLink.textContent = 'Delete'
            deleteLink.className = 'right'
            deleteLink.href = '/delete/' + item.hash
            deleteLink.addEventListener('click', (e) ->
                e.preventDefault()
                confirm((a) ->
                    return if not a
                    UserHistory.remove(item.hash)
                    container.parentElement.removeChild(container)
                    API.deleteFile(item.hash)
                    loadCurrentPage()
                )
            , false)
            deleteLink.title = 'Delete this item from the site'
            bar.appendChild(deleteLink)

            a = document.createElement('a')
            a.href = '/' + item.hash
            a.appendChild(preview)
            container.appendChild(a)
            container.appendChild(bar)
            outerContainer.appendChild(container)
            outerContainer.className = 'item-wrapper'
            return outerContainer
        else
            container.appendChild(preview)
            return container

createPagination = ->
    history = UserHistory.getHistory()
    return if history.length < itemsPerPage
    for pagination in document.querySelectorAll('.pagination')
        pagination.removeChild(pagination.lastChild) while pagination.hasChildNodes()

        pages = Math.ceil(history.length / itemsPerPage)
        page = getCurrentPage()

        createButton = (href, text, classes) ->
            li = document.createElement('li')
            if href
                content = document.createElement('a')
                content.href = href
            else
                content = document.createElement('span')
            content.textContent = text
            li.appendChild(content)
            pagination.appendChild(li)
            li.className = classes if classes
            return content

        if page > 0
            createButton("##{page - 1}", "< Prev")

        left = paginationLimit - 1
        right = pages - paginationLimit
        if right < left + 2 or left > pages
            right = history.length
            left = 0
        for i in [0...pages]
            if i < left or i > right or Math.abs(page - i) < paginationLimit
                if page == i
                    createButton(null, i + 1, 'selected')
                else
                    createButton("##{i}", i + 1, null)
            else
                if left < page < right
                    createButton(null, '...', 'smart-pagination') if Math.abs(page - i) == paginationLimit
                else
                    createButton(null, '...', 'smart-pagination') if i == left or i == right

        if page < Math.floor(UserHistory.getHistory().length / itemsPerPage)
            createButton("##{page + 1}", "Next >")

getCurrentPage = ->
    page = 0
    if window.location.hash.length >= 1
        page = parseInt(window.location.hash.substr(1))
        if page == NaN
            page = 0
        else if page >= UserHistory.getHistory().length / itemsPerPage
            page = Math.ceil(UserHistory.getHistory().length / itemsPerPage - 1)
            window.location.hash = '#' + page
    return page
