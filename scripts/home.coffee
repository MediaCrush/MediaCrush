worker = new Worker('/static/worker.js')
templates = { }
window.templates = templates
albumAttached = false

window.addEventListener('load', ->
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
    compile = (name) -> Handlebars.compile(document.getElementById(name + '-template').innerHTML)
    templates.preview = compile 'preview'

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
    if document.activeElement.tagName in ['TEXTAREA', 'INPUT']
        setTimeout(forceFocus, 250)
        return
    pasteTarget = document.getElementById('paste-target')
    pasteTarget.focus()
    setTimeout(forceFocus, 250)

createHistoryItem = (h) ->
    item = h.item
    container = null
    if h.base?
        container = document.createElement(data.base)
    else
        container = document.createElement('li')
    if item.blob_type == 'video'
        preview = document.createElement('video')
        preview.setAttribute('loop', 'true')
        for file in item.files
            if file.type.indexOf('video/') == 0
                source = document.createElement('source')
                source.src = file.file
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
            preview.src = file.file
            break
        preview.className = 'item-view'
    else if item.blob_type == 'audio'
        preview = document.createElement('img')
        preview.src = '/static/audio-player-narrow.png'
        preview.className = 'item-view'
    else if item.type == 'application/album'
        console.log('album')
    if preview
        if not h.nolink
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
    console.log(JSON.stringify(e.data))
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

handleFiles = (files) ->
    if albumAttached
        albumUI.querySelector('.button').classList.add('hidden')
        albumUI.querySelector('.status').classList.remove('hidden')
        albumUI.querySelector('.status').textContent = 'Processing, please wait...'
        albumUI.querySelector('.result').classList.add('hidden')
    dropArea = document.getElementById('droparea')
    dropArea.style.overflowY = 'scroll'
    dropArea.classList.add('files')
    fileList = document.getElementById('files')
    if Object.keys(uploadedFiles).length == 0
        document.getElementById('files').innerHTML = ''
    for file in files
        ((file) ->
            mediaFile = new MediaFile(file)
            mediaFile.preview = templates.preview(mediaFile).toDOM()
            fileList.appendChild(mediaFile.preview)
            mediaFile.preview = fileList.lastElementChild
            mediaFile.loadPreview()
            mediaFile.hash = new String(guid())
            mediaFile.updateStatus('preparing')
            uploadedFiles[mediaFile.hash] = mediaFile
            reader = new FileReader()
            reader.onloadend = (e) ->
                try
                    data = e.target.result
                    worker.postMessage({ action: 'compute-hash', data: data, callback: 'hashCompleted', id: mediaFile.hash })
                catch e # Too large
                    uploadFile(mediaFile)
            reader.readAsBinaryString(file)
        )(file)

hashCompleted = (id, result) ->
    file = uploadedFiles[id]
    delete uploadedFiles[id]
    file.hash = result
    uploadedFiles[result] = file
    file.isHashed = true
    uploadFile(file)

handlePaste = (e) ->
    target = document.getElementById('paste-target')
    if e.clipboardData
        text = e.clipboardData.getData('text/plain')
        if text
            if text.indexOf('http://') == 0 or text.indexOf('https://') == 0
                uploadUrl(text)
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

uploadUrl = (url) ->
    if albumAttached
        albumUI.querySelector('.button').classList.add('hidden')
        albumUI.querySelector('.status').classList.remove('hidden')
        albumUI.querySelector('.status').textContent = 'Processing, please wait...'
        albumUI.querySelector('.result').classList.add('hidden')
    dropArea = document.getElementById('droparea')
    dropArea.style.overflowY = 'scroll'
    dropArea.classList.add('files')
    fileList = document.getElementById('files')
    if Object.keys(uploadedFiles).length == 0
        document.getElementById('files').innerHTML = ''

    file = new MediaFile(url)
    fileList = document.getElementById('files')
    file.preview = templates.preview(file).toDOM()
    fileList.appendChild(file.preview)
    file.preview = fileList.lastElementChild
    file.loadPreview()
    API.uploadUrl(file, (result) ->
        file = result.file
        if result.error?
            file.setError(result.error)
            return
        uploadedFiles[file.hash] = file
        if file.status == 'done'
            finish(file)
        else
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
    console.log(file)
    console.log(status)
    console.log(oldStatus)
    if oldStatus?
        return if status == 'ready' and oldStatus == 'done'
    updateAlbumUI()
