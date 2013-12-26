worker = new Worker('/static/worker.js')
templates = { }
window.templates = templates

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

    worker.addEventListener('message', handleWorkerMessage)
    worker.postMessage({ action: 'load' })
    compile = (name) -> Handlebars.compile(document.getElementById(name + '-template').innerHTML)
    templates.preview = compile 'preview'
, false)

window.onbeforeunload = ->
    if false
        return 'If you leave this page, your uploads will be cancelled.'

handleWorkerMessage = (e) ->
    console.log(JSON.stringify(e.data))
    if e.data.execute?
        eval(e.data.execute)

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
    dropArea = document.getElementById('droparea')
    dropArea.style.overflowY = 'scroll'
    dropArea.classList.add('files')
    fileList = document.getElementById('files')
    if Object.keys(uploadedFiles).length == 0
        document.getElementById('files').innerHTML = ''
    for file in files
        mediaFile = new MediaFile(file)
        mediaFile.preview = templates.preview(mediaFile).toDOM()
        fileList.appendChild(mediaFile.preview)
        mediaFile.preview = fileList.lastElementChild
        mediaFile.loadPreview(file)
        mediaFile.hash = new String(guid())
        mediaFile.file = file
        mediaFile.updateStatus('preparing')
        uploadedFiles[mediaFile.hash] = mediaFile
        reader = new FileReader()
        reader.onloadend = (e) ->
            try
                data = e.target.result
                worker.postMessage({ action: 'compute-hash', data: data, callback: 'hashCompleted', id: mediaFile.hash })
            catch e # Too large
                mediaFile.updateStatus('uploading')
                uploadFile(mediaFile)
        reader.readAsBinaryString(file)

hashCompleted = (id, result) ->
    file = uploadedFiles[id]
    delete uploadedFiles[id]
    file.hash = result
    uploadedFiles[result] = file
    file.isHashed = true
    file.updateStatus('uploading')
    uploadFile(file)

uploadFile = (file) ->
    # TODO
