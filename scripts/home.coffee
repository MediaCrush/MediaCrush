worker = new Worker('/static/worker.js')
window.backgroundWorker = worker
albumAttached = false
maxConcurrentUploads = 3

window.addEventListener('DOMContentLoaded', ->
    window.addEventListener('dragenter', dragNop, false)
    window.addEventListener('dragleave', dragNop, false)
    window.addEventListener('dragover', dragNop, false)
    window.addEventListener('drop', handleDragDrop, false)
    document.getElementById('browse-link').addEventListener('click', (e) ->
        e.preventDefault()
        document.getElementById('browse').click()
    , false)
    document.getElementById('browse').addEventListener('change', (e) ->
        handleFiles(e.target.files)
    , false)
    albumUI = document.getElementById('albumUI')
    albumUI.querySelector('.button').addEventListener('click', (e) ->
        e.preventDefault()
        albumUI.querySelector('.button').classList.add('hidden')
        albumUI.querySelector('.status').classList.remove('hidden')
        albumUI.querySelector('.status').textContent = 'Processing, please wait...'
        albumAttached = true
        createAlbum()
    , false)

    worker.addEventListener('message', handleWorkerMessage)
    worker.postMessage({ action: 'load' })
    window.statusChange = (file, status, oldStatus) ->
        if oldStatus == 'uploading'
            uploadPendingItems()
    # We kick this manually every so often to make sure nothing gets abandoned in the 'Pending' state
    setInterval(uploadPendingFiles, 10000)

    pasteTarget = document.getElementById('paste-target')
    pasteTarget.addEventListener('paste', handlePaste, false)
    forceFocus()

    historyEnabled = document.getElementById('historyEnabled')
    if not UserHistory.getHistoryEnabled()
        historyEnabled.textContent = 'Enable local history'
    historyEnabled.addEventListener('click', (e) ->
        e.preventDefault()
        if UserHistory.toggleHistoryEnabled()
            historyEnabled.textContent = 'Disable local history'
        else
            historyEnabled.textContent = 'Enable local history'
    , false)

    items = UserHistory.getHistory()[..].reverse()[..4]
    historyContainer = document.getElementById('history')
    historyList = historyContainer.querySelector('ul')
    blurb = document.getElementById('blurb')
    if items.length != 0
        spinner = document.createElement('div')
        spinner.className = 'progress'
        blurb.appendChild(spinner)
        UserHistory.loadDetailedHistory(items, (result) ->
            blurb.classList.add('hidden')
            historyContainer.classList.remove('hidden')
            spinner.parentElement.removeChild(spinner)
            for item in items
                if result[item]
                    historyList.appendChild(createHistoryItem({ item: result[item], hash: item }))
        )
, false)

forceFocus = ->
    if document.activeElement.tagName in ['TEXTAREA', 'INPUT', 'IFRAME']
        setTimeout(forceFocus, 250)
        return
    pasteTarget = document.getElementById('paste-target')
    pasteTarget.focus()
    setTimeout(forceFocus, 250)

createHistoryItem = (h, noLink = false) ->
    item = h.item
    container = null
    if h.base?
        container = document.createElement(data.base)
    else
        container = document.createElement('li')
    if item.blob_type == 'video'
        preview = document.createElement('video')
        preview.setAttribute('loop', 'true')
        preview.poster = '/' + item.hash + '.jpg'
        for file in item.files
            if file.type.indexOf('video/') == 0
                source = document.createElement('source')
                source.src = window.cdn + file.file
                source.type = file.type
                preview.appendChild(source)
        preview.volume = 0
        preview.className = 'item-view'
        preview.onmouseenter = (e) ->
            e.target.play()
        preview.onmouseleave = (e) ->
            e.target.pause()
    else if item.blob_type == 'image'
        preview = document.createElement('img')
        for file in item.files
            if not file.type.indexOf('image/') == 0
                continue
            preview.src = window.cdn + file.file
            break
        preview.className = 'item-view'
    else if item.blob_type == 'audio'
        preview = document.createElement('img')
        preview.src = '/static/audio-player-narrow.png'
        preview.className = 'item-view'
    else if item.type == 'application/album'
        preview = document.createElement('div')
        preview.className = 'album-preview'
        for file in item.files
            preview.appendChild(createHistoryItem(file, true))
    if preview
        if not noLink
            a = document.createElement('a')
            a.href = '/' + h.hash
            a.target = '_blank'
            a.appendChild(preview)
            container.appendChild(a)
    return container

window.onbeforeunload = ->
    for f of uploadedFiles
        if uploadedFiles[f].status not in ['done', 'error', 'ready']
            return 'If you leave this page, your uploads will be cancelled.'

handleWorkerMessage = (e) ->
    if e.data.execute?
        eval(e.data.execute)
    if e.data.event?
        switch e.data.event
            when 'file-status-change' then fileStatusChanged(e.data)

dragNop = (e) ->
    e.stopPropagation()
    e.preventDefault()

handleDragDrop = (e) ->
    dragNop(e)
    droparea = document.getElementById('droparea')
    droparea.classList.remove('hover') if droparea.classList.contains('hover')
    files = e.dataTransfer.files
    handleFiles(files) if files.length > 0

pendingFiles = []
updateQueue = ->
    files = pendingFiles.splice(0, 5)
    urls = pendingUrls.splice(0, 5)
    fileList = document.getElementById('files')
    scrollingContainer = document.getElementById('droparea')
    for file in files
        ((file) ->
            mediaFile = new MediaFile(file)
            mediaFile.preview = createPreview(file.name)
            _ = scrollingContainer.scrollTop
            fileList.appendChild(mediaFile.preview)
            scrollingContainer.scrollTop = _
            mediaFile.preview = fileList.lastElementChild
            mediaFile.loadPreview()
            mediaFile.hash = new String(guid())
            mediaFile.updateStatus('local-pending')
            uploadedFiles[mediaFile.hash] = mediaFile
        )(file)
    for url in urls
        ((url) ->
            mediaFile = new MediaFile(url)
            mediaFile.preview = createPreview(mediaFile.name)
            _ = scrollingContainer.scrollTop
            fileList.appendChild(mediaFile.preview)
            scrollingContainer.scrollTop = _
            mediaFile.preview = fileList.lastElementChild
            mediaFile.loadPreview()
            mediaFile.hash = new String(guid())
            mediaFile.updateStatus('local-pending')
            uploadedFiles[mediaFile.hash] = mediaFile
        )(url)
    if pendingFiles.length + pendingUrls.length > 0
        setTimeout(updateQueue, 500)
    if files.length > 0
        uploadPendingFiles()

handleFiles = (files) ->
    if albumAttached
        albumUI.querySelector('.button').classList.add('hidden')
        albumUI.querySelector('.status').classList.remove('hidden')
        albumUI.querySelector('.status').textContent = 'Processing, please wait...'
        albumUI.querySelector('.result').classList.add('hidden')
    if Object.keys(uploadedFiles).length == 0
        document.getElementById('files').innerHTML = ''
        dropArea = document.getElementById('droparea')
        dropArea.style.overflowY = 'scroll'
        dropArea.classList.add('files')
    pendingFiles.push(file) for file in files
    updateQueue()
window.handleFiles = handleFiles

uploadPendingFiles = ->
    toUpload = []
    uploading = 0
    for hash, file of uploadedFiles
        if file.status in ['preparing', 'uploading']
            uploading++
            return if uploading >= maxConcurrentUploads
        else if file.status == 'local-pending' and toUpload.length < 5
            toUpload.push(file)
    for file in toUpload
        ((file) ->
            if file.isUrl
                uploadUrlFile(file)
            else
                reader = new FileReader()
                reader.onloadend = (e) ->
                    try
                        data = e.target.result
                        file.updateStatus('preparing')
                        worker.postMessage({ action: 'compute-hash', data: data, callback: 'hashCompleted', id: file.hash })
                    catch e # Too large
                        uploadFile(file)
                reader.readAsBinaryString(file.file)
        )(file)

hashCompleted = (id, result) ->
    file = uploadedFiles[id]
    file.hash = result
    delete uploadedFiles[id]
    uploadedFiles[result] = file
    file.isHashed = true
    uploadFile(file)

handlePaste = (e) ->
    target = document.getElementById('paste-target')
    if e.clipboardData
        text = e.clipboardData.getData('text/plain')
        if text
            if text.indexOf('http://') == 0 or text.indexOf('https://') == 0
                urls = text.split('\n')
                uploadUrls(url.trim() for url in urls when url.indexOf('http://') == 0 or url.indexOf('https://') == 0)
                target.innerHTML = ''
            else
                # todo: plaintext
        else
            if e.clipboardData.items # webkit
                for item in e.clipboardData.items
                    if item.type.indexOf('image/') == 0
                        file = item.getAsFile
                        file.name = 'Clipboard'
                        handleFiles([ file ])
            else # not webkit
                check = ->
                    if target.innerHTML != ''
                        img = target.firstChild.src
                        if img.indexOf('data:image/png;base64,') == 0
                            blob = dataURItoBlob(img)
                            blob.name = 'Clipboard'
                            handleFiles([ blob ])
                        target.innerHTML = ''
                    else
                        setTimeout(check, 100)
                check()

pendingUrls = []
uploadUrls = (urls) ->
    if albumAttached
        albumUI.querySelector('.button').classList.add('hidden')
        albumUI.querySelector('.status').classList.remove('hidden')
        albumUI.querySelector('.status').textContent = 'Processing, please wait...'
        albumUI.querySelector('.result').classList.add('hidden')
    if Object.keys(uploadedFiles).length == 0
        document.getElementById('files').innerHTML = ''
        dropArea = document.getElementById('droparea')
        dropArea.style.overflowY = 'scroll'
        dropArea.classList.add('files')
    pendingUrls.push(url) for url in urls
    updateQueue()

uploadUrlFile = (file) ->
    oldHash = file.hash
    API.uploadUrl(file, (result) ->
        uploadedFiles[file.hash] = file
        if result.error?
            file.setError(result.error)
            return
        file = result.file
        delete uploadedFiles[oldHash]
        uploadedFiles[file.hash] = file
        if file.status == 'done'
            finish(file)
        else
            file.isUserOwned = true
            worker.postMessage({ action: 'monitor-status', hash: file.hash })
    )

uploadFile = (file) ->
    oldHash = file.hash
    upload = ->
        file.updateStatus('uploading')
        API.uploadFile(file, (e) ->
            if e.lengthComputable
                file.updateProgress(e.loaded / e.total)
        , (result) ->
            file.file = null
            if result.error?
                file.setError(result.error)
                return
            if file.hash != oldHash # for larger files, the server does the hashing for us
                delete uploadedFiles[oldHash]
                uploadedFiles[file.hash] = file
            if file.status == 'done'
                finish(file)
            else
                file.isUserOwned = true
                worker.postMessage({ action: 'monitor-status', hash: file.hash })
        )
    if file.isHashed
        API.checkExists(file, (exists) ->
            if exists
                file.file = null
                file.isUserOwned = false
                file.updateStatus('done')
                finish(file)
                return
            else
                upload()
        )

fileStatusChanged = (e) ->
    uploadedFiles[e.hash].updateStatus(e.status)
    if e.file? and e.file.flags?
        uploadedFiles[e.hash].setFlags(e.file.flags)
    if e.status in ['ready', 'done']
        uploadedFiles[e.hash].blob = e.file
        finish(uploadedFiles[e.hash])

finish = (file) ->
    file.finish()
    updateAlbumUI()

updateAlbumUI = ->
    if albumAttached
        createAlbum()
    else
        keys = []
        for f, v of uploadedFiles
            if v.status in ['processing', 'pending', 'ready', 'done', 'uploading']
                keys.push(f)
        albumUI = document.getElementById('albumUI')
        if keys.length >= 2
            albumUI.querySelector('.button').classList.remove('hidden')
        else
            albumUI.querySelector('.button').classList.add('hidden')

createAlbum = ->
    keys = []
    for f, v of uploadedFiles
        if v.status in ['done', 'ready']
            keys.push(v)
        else
            return
    return unless keys.length >= 2
    keys.sort((a, b) -> a.index - b.index)
    keys = (a.hash for a in keys)
    API.createAlbum(keys, (result) ->
        albumUI = document.getElementById('albumUI')
        if result.error?
            albumUI.querySelector('.status').classList.remove('hidden')
            albumUI.querySelector('.status').textContent = 'An error occured creating this album.'
            albumUI.querySelector('.button').classList.remove('hidden')
            albumUI.querySelector('.button').textContent = 'Try again'
        else
            albumUI.querySelector('.status').classList.add('hidden')
            albumUI.querySelector('.result a').textContent = window.location.origin + "/#{result.hash}"
            albumUI.querySelector('.result a').href = window.location.origin + "/#{result.hash}"
            albumUI.querySelector('.result').classList.remove('hidden')
    )

window.statusHook = (file, status, oldStatus) ->
    if oldStatus?
        return if status == 'ready' and oldStatus == 'done'
    updateAlbumUI()

createPreview = (name) ->
    create = (element, className) ->
        _ = document.createElement(element)
        _.className = className if className?
        return _
    container = create('div', 'media-preview')
    preview = create('div', 'preview')
    fade = create('div', 'respondive-fade')
    title = create('h2')
    title.title = name
    title.textContent = name
    flags = create('div', 'flags hidden')
    status = create('div', 'status')
    error = create('div', 'error hidden')
    link = create('a', 'link hidden')
    deleteLink = create('a', 'delete hidden')
    deleteLink.textContent = 'Delete'
    fullSize = create('a', 'full-size hidden')
    progress = create('div', 'progress')
    progress.style.width = 0
    container.appendChild(preview)
    container.appendChild(fade)
    container.appendChild(title)
    container.appendChild(flags)
    container.appendChild(status)
    container.appendChild(error)
    container.appendChild(link)
    container.appendChild(deleteLink)
    container.appendChild(fullSize)
    container.appendChild(progress)
    return container
