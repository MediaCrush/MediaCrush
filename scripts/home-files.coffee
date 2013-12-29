window.uploadedFiles = {}

class MediaFile
    constructor: (@file) ->
        if @file instanceof Blob or @file instanceof File
            @isUrl = false
            @name = @file.name
        else
            @name = @file
            @isUrl = true
        @status = 'none'
        @hash = guid() # Replaced with actual hash once computed
        @isHashed = false

    setError: (error) ->
        @updateStatus('error')
        @preview.querySelector('.error').textContent = error
    
    updateStatus: (status) ->
        @status = status
        @preview.querySelector('.status').textContent = switch status
            when 'preparing' then "Preparing..."
            when 'uploading' then "Uploading..."
            when 'pending' then "Waiting to process..."
            when 'processing' then "Processing..."
            when 'ready' then "Upload complete!"
            when 'done' then "Upload complete!"
        progress = @preview.querySelector('.progress')
        if status == 'preparing'
            progress.className = 'progress progress-grey'
            progress.style.width = '100%'
        else if status == 'pending'
            progress.className = 'progress progress-grey'
            progress.style.width = '100%'
        else if status == 'uploading'
            progress.className = 'progress'
            progress.style.width = '0%'
        else if status == 'processing'
            progress.className = 'progress progress-green'
            progress.style.width = '100%'
        else if status == 'done' or status == 'ready'
            progress.style.display = 'none'
        else if status == 'unrecognized'
            @preview.querySelector('.status').style.display = 'none'
            error = @preview.querySelector('.error')
            error.classList.remove('hidden')
            error.textContent = 'MediaCrush does not accept this kind of file.'
            progress.className = 'progress progress-stalled progress-red'
        else
            @preview.querySelector('.status').style.display = 'none'
            error = @preview.querySelector('.error')
            error.classList.remove('hidden')
            error.textContent = 'There was a problem with this file.'
            progress.className = 'progress progress-stalled progress-red'
    
    loadPreview: ->
        if @isUrl
            @loadUrlPreview()
            return
        uri = URL.createObjectURL(@file)
        _ = null
        if @file.type.indexOf('image/') == 0
            _ = document.createElement('img')
            _.src = uri
        else if @file.type.indexOf('audio/') == 0
            _ = document.createElement('img')
            _.src = '/static/audio.png'
        else if @file.type.indexOf('video/') == 0
            _ = document.createElement('video')
            _.setAttribute('loop', 'true')
            source = document.createElement('source')
            fallback = document.createElement('img')
            fallback.src = '/static/video.png'
            source.addEventListener('error', ->
                _.parentElement.replaceChild(fallback, _)
            , false)
            source.setAttribute('src', uri)
            source.setAttribute('type', @file.type)
            _.appendChild(source)
            _.volume = 0
            _.play()
        else
            _ = document.createElement('img')
            _.src = '/static/video.png'
        @preview.querySelector('.preview').appendChild(_)

    loadUrlPreview: ->
        _ = document.createElement('img')
        _.src = @file
        @preview.querySelector('.preview').appendChild(_)
    
    updateProgress: (amount) ->
        @preview.querySelector('.progress').style.width = (amount * 100) + '%'

    setFlags: (flags) ->
        return if @flags?
        @flags = flags
        list = @preview.querySelector('.flags')

        self = this
        updateFlag = (e) ->
            flag = e.target.getAttribute('data-flag')
            self.flags[flag] = !self.flags[flag]
            API.setFlags(self.hash, self.flags)

        for flag, value of flags
            name = flag.substr(1)
            name = flag[0].toUpperCase() + name
            input = document.createElement('input')
            input.type = 'checkbox'
            input.name = input.id = "flag-#{flag}-#{@hash}"
            input.setAttribute('data-flag', flag)
            input.setAttribute('data-media', @hash)
            input.checked = value
            input.addEventListener('change', updateFlag, false)
            label = document.createElement('label')
            label.for = "flag-#{flag}-#{@hash}"
            label.className = 'checkbox'
            span = document.createElement('span')
            span.textContent = flag
            label.appendChild(input)
            label.appendChild(span)
            list.appendChild(label)
        list.classList.remove('hidden')
        window.statusHook(this) if window.statusHook

    finish: ->
        UserHistory.add(@hash)
        largeLink = @preview.querySelector('.full-size')
        link = @preview.querySelector('.link')
        link.textContent = window.location.origin + "/#{@hash}"
        largeLink.href = link.href = "/#{@hash}"
        link.classList.remove('hidden')
        largeLink.classList.remove('hidden')
        if @isUserOwned
            deleteLink = @preview.querySelector('.delete')
            deleteLink.href = "/api/#{@hash}/delete"
            self = this
            deleteLink.addEventListener('click', (e) ->
                e.preventDefault()
                confirm((result) ->
                    if result
                        API.deleteFile(self.hash)
                        self.preview.parentElement.removeChild(self.preview)
                        self.status = 'deleted'
                        delete uploadedFiles[self.hash]
                        if Object.keys(uploadedFiles).length == 0
                            document.getElementById('droparea').classList.remove('files')
                        window.statusHook(self) if window.statusHook
                )
            , false)
            deleteLink.classList.remove('hidden')
        
window.MediaFile = MediaFile
