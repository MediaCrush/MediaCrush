window.addEventListener('DOMContentLoaded', () ->
    input.addEventListener('mouseenter', (e) ->
        e.target.focus()
        e.target.select()
    ) for input in document.querySelectorAll('input.selectall')
    switch window.albumType
        when 'list' then initializeScrollLoading(true, 3)
        when 'focus' then initializeFocus()
    
    document.getElementById('album-download').addEventListener('click', (e) ->
        e.preventDefault()
        e.target.classList.add('hidden')
        downloadAlbum()
    , false)
, false)

zipComplete = false
downloadAlbum = () ->
    API.zipAlbum(window.filename, (result) ->
        if result.error?
            alert('An error occured with your request.')
            return
        if result.status == 'done'
            downloadFinishedZip()
        else if result.status == 'success'
            showDownloadModal()
            window.onbeforeunload = ->
                if not zipComplete
                    return "If you leave this page, you won't get your zip file."
            window.setTimeout(pollZip, 1000)
        else
            alert('An error occured with your request.')
    )

downloadFinishedZip = () ->
    iframe = document.createElement('iframe')
    iframe.src = "/download/#{window.filename}.zip"
    iframe.className = 'hidden'
    document.body.appendChild(iframe)
    zipComplete = true

pollZip = () ->
    API.zipAlbum(window.filename, (result) ->
        if result.status == 'done'
            downloadFinishedZip()
        else
            window.setTimeout(pollZip, 1000)
    )

showDownloadModal = () ->
    document.querySelector('.album-pending').classList.remove('hidden')
    document.querySelector('.album-pending .no').focus()
    dialogNo = document.querySelector('.dialog .no')
    dialogNo.addEventListener('click', (e) ->
        e.preventDefault()
        document.querySelector('.album-pending').classList.add('hidden')
    , false)

selected = 0
loaded = 6

focusLeft = (e) ->
    e.preventDefault() if e?
    return if selected == 0
    focus = document.querySelector('.focus .selected')
    item = focus.firstElementChild
    video = item.querySelector('video')
    paused = video.paused if video
    focus.removeChild(item)

    sidebarItem = document.createElement('div')
    sidebarItem.className = 'item'
    mediaItem = document.createElement('div')
    mediaItem.className = 'media-item'
    mediaItem.dataset.index = selected
    clearfix = document.createElement('div')
    clearfix.classList.add('clearfix')
    target = document.createElement('a')
    target.classList.add('target')
    target.href = '#'
    target.addEventListener('click', clickFocus, false)
    mediaItem.appendChild(item)
    sidebarItem.appendChild(mediaItem)
    sidebarItem.appendChild(clearfix)
    sidebarItem.appendChild(target)
    sidebar = document.querySelector('.focus .items')
    sidebar.insertBefore(sidebarItem, sidebar.firstElementChild)

    video.play() if video and !paused

    selected--
    selected %= window.files.length
    next = window.files[selected]
    xhr = new XMLHttpRequest()
    xhr.open('GET', "/#{next.hash}/fragment")
    xhr.onload = () ->
        focus.innerHTML = this.responseText
    xhr.send()
    populateFocus()

focusRight = (e) ->
    e.preventDefault() if e?
    return if selected == window.files.length - 1
    focusItem(document.querySelector('.focus .items .item .media-item'))

focusItem = (item) ->
    container = item.parentElement
    items = container.parentElement
    video = item.querySelector('video')
    playing = !video.paused if video
    container.parentElement.removeChild(container)
    focus = document.querySelector('.focus .selected')
    focus.innerHTML = ''
    focus.appendChild(item)
    item.style.maxWidth = video.videoWidth + 'px' if video
    video.play() if video and playing
    index = parseInt(item.dataset.index)
    temp = index - 1
    while temp != selected
        items.removeChild(items.querySelector('.item'))
        temp -= 1
    selected = index
    populateFocus()

populateFocus = () ->
    document.querySelector('.controls .index').textContent = selected + 1
    if selected == 0
        document.querySelector('.controls .previous').classList.add('hidden')
    else
        document.querySelector('.controls .previous').classList.remove('hidden')
    if selected == window.files.length - 1
        document.querySelector('.controls .next').classList.add('hidden')
    else
        document.querySelector('.controls .next').classList.remove('hidden')
    selected %= window.files.length
    while loaded - selected < 6
        next = window.files[loaded % window.files.length]
        ((loaded) ->
            xhr = new XMLHttpRequest()
            xhr.open('GET', "/#{next.hash}/fragment")
            xhr.onload = () ->
                item = document.createElement('div')
                item.className = 'item'
                mediaItem = document.createElement('div')
                mediaItem.className = 'media-item'
                mediaItem.dataset.hash = next.hash
                mediaItem.dataset.index = loaded % window.files.length
                clearfix = document.createElement('div')
                clearfix.classList.add('clearfix')
                target = document.createElement('a')
                target.classList.add('target')
                target.href = '#'
                target.addEventListener('click', clickFocus, false)
                mediaItem.innerHTML = this.responseText
                item.appendChild(mediaItem)
                item.appendChild(clearfix)
                item.appendChild(target)
                document.querySelector('.focus .items').appendChild(item)
                hidden.classList.remove('hidden-if-noscript')  for hidden  in document.querySelectorAll('.hidden-if-noscript')
            xhr.send()
        )(loaded)
        loaded++

clickFocus = (e) ->
    e.preventDefault()
    focusItem(e.target.parentElement.querySelector('.media-item'))

initializeFocus = () ->
    item.addEventListener('click', clickFocus, false) for item in document.querySelectorAll('.focus .right .item')
    window.addEventListener('keypress', (e) ->
        if e.keyCode == 37 # left
            focusLeft()
        if e.keyCode == 39 # right
            focusRight()
    , false)
    document.querySelector('.focus .controls .previous').addEventListener('click', focusLeft, false)
    document.querySelector('.focus .controls .next').addEventListener('click', focusRight, false)

initializeScrollLoading = (includeClearfix, itemsLoaded) ->
    getScroll = () ->
        doc = document.documentElement
        body = document.body
        return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
    viewPortHeight = () ->
        de = document.documentElement
        return window.innerHeight if window.innerWidth?
        return de.clientHeight
    getBottomOfLastItem = () ->
        items = document.querySelectorAll('.media-wrapper')
        element = items[items.length - 1]
        return getPosition(element)[1]

    lastItemY = getBottomOfLastItem()
    if window.files.length < 3
        itemsLoaded = window.files.length
    isLoading = false

    checkLoad = () ->
        return if itemsLoaded == window.files.length
        return if isLoading
        if lastItemY - getScroll() < viewPortHeight()
            isLoading = true
            document.querySelector('.progress').classList.remove('hidden')
            nextItem = window.files[itemsLoaded]
            xhr = new XMLHttpRequest()
            xhr.open('GET', "/#{nextItem.hash}/fragment")
            xhr.onload = ->
                document.querySelector('.progress').classList.add('hidden')
                wrapper = document.createElement('div')
                wrapper.classList.add('media-wrapper')
                media = document.createElement('div')
                media.classList.add('media')
                column = document.createElement('div')
                column.classList.add('column')
                clearfix = document.createElement('div')
                clearfix.classList.add('clearfix')
                media.innerHTML = this.responseText
                update = () ->
                    lastItemY = getBottomOfLastItem()
                    isLoading = false
                    itemsLoaded++
                    checkLoad()
                media.querySelector('img').addEventListener('load', update, false) if media.querySelector('img')
                media.querySelector('video,audio').addEventListener('loadedmetadata', update, false) if media.querySelector('audio,video')
                if nextItem.blob_type == 'audio' or nextItem.blob_type == 'video'
                    new MediaPlayer(media.querySelector('.player'))
                wrapper.appendChild(media)
                if includeClearfix
                    document.getElementById('album-files').appendChild(wrapper)
                    document.getElementById('album-files').appendChild(clearfix)
                else
                    column.appendChild(wrapper)
                    document.getElementById('album-files').appendChild(column)
                hidden.classList.remove('hidden-if-noscript')  for hidden  in document.querySelectorAll('.hidden-if-noscript')
            xhr.send()
    checkLoad()
    window.addEventListener('scroll', checkLoad)
