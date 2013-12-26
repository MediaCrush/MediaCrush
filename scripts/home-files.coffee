class MediaFile
    constructor: (file) ->
        @name = file.name
        @status = 'none'
        @hash = guid() # Replaced with actual hash once computed
        @isHashed = false
    
    updateStatus: (status) ->
        @status = status
        @preview.querySelector('.status').textContent = switch status
            when 'preparing' then "Preparing..."
            when 'uploading' then "Uploading..."
            when 'pending' then "Waiting to process..."
            when 'processing' then "Processing..."
            when 'done' then "Upload complete!"
        progress = @preview.querySelector('.progress')
        if status in ['preparing', 'pending']
            progress.className = 'progress progress-grey'
            progress.style.width = '100%'
        else if status == 'uploading'
            progress.className = 'progress'
            progress.style.width = '0%'
        else if status == 'processing'
            progress.className = 'progress progress-green'
            progress.style.width = '100%'
        else if status == 'done'
            progress.style.display = 'none'
    
    loadPreview: (file) ->
        uri = file.name
        if file instanceof File or file instanceof Blob
            uri = URL.createObjectURL(file)
        _ = null
        if file.type.indexOf('image/') == 0
            _ = document.createElement('img')
            _.src = uri
        else if file.type.indexOf('audio/') == 0
            _ = document.createElement('img')
            _.src = '/static/audio.png'
        else if file.type.indexOf('video/') == 0
            _ = document.createElement('video')
            _.setAttribute('loop', 'true')
            source = document.createElement('source')
            fallback = document.createElement('img')
            fallback.src = '/static/video.png'
            source.addEventListener('error', ->
                _.parentElement.replaceChild(fallback, _)
            , false)
            source.setAttribute('src', uri)
            source.setAttribute('type', file.type)
            _.appendChild(source)
            _.volume = 0
            _.play()
        @preview.querySelector('.preview').appendChild(_)
        

window.MediaFile = MediaFile
window.uploadedFiles = {}
