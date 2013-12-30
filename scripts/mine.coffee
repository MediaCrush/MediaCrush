detailedHistory = {}
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

createPagination = ->
    return if history = UserHistory.getHistory().length < itemsPerPage
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
        for i in [0..pages]
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
