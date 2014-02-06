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
    switch window.albumType
        when 'list' then initializeScrollLoading(true, 3)
        when 'grid' then initializeScrollLoading(false, 8)
        when 'focus' then initializeFocus()
, false)


initializeFocus = () ->
    console.log 'focus'

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
            xhr.send()
    checkLoad()
    window.addEventListener('scroll', checkLoad)
