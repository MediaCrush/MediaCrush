detailedHistory = {}
itemsToLoad = []
itemsPerPage = 10
maxPagesInPagination = 6

window.addEventListener('load', ->
    if not UserHistory.getHistoryEnabled()
        document.getElementById('disabledText').classList.remove('hidden')
        document.getElementById('history-toggle').textContent = 'enable local history'
    loadCurrentPage()
    window.onhashchange = ->
        window.scrollTo(0, 0)
        loadCurrentPage()
, false)

loadCurrentPage = ->
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
            loadPage(itemsToLoad)
        )
    else
        loadPage(itemsToLoad)

loadPage = (items) ->
    container = document.getElementById('items')
    container.appendChild(createView(item)) for item in items

createView = (item) ->
    # todo

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

        adjacent = Math.floor(maxPagesInPagination / 2)
        for i in [0...pages]
            wrapped = pages > maxPagesInPagination and i >= adjacent and i <= pages - adjacent - 1 and i != page - 1 and i != page and i != page + 1
            if page == i
                createButton(null, i + 1, 'selected')
            else
                createButton("##{i}", i + 1, wrapped ? 'wrapped' : null)

            if wrapped and i == adjacent and page >= adjacent
                createButton(null, '...', 'smart-pagination')

            if wrapped and i == pages - adjacent and page < pages - adjacent
                createButton(null, '...', 'smart-pagination')

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
