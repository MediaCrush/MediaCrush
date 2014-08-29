((xhr) ->
    open = XMLHttpRequest.prototype.open
    xhr.prototype.open = () ->
        open.apply(this, arguments)
        this.setRequestHeader('X-Requested-With','XMLHttpRequest')
)(XMLHttpRequest)

API = new (->
    self = this

    self.uploadFile = (file, progress, callback) ->
        xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload/file')
        xhr.upload.onprogress = progress
        xhr.onload = ->
            switch this.status
                when 415
                    error = "This media format is not supported."
                when 420
                    error = "You're uploading too much! Try again later."
                when 409
                    response = JSON.parse(this.responseText)
                    file.isUserOwned = false
                    file.hash = response['hash']
                    file.isHashed = true
                    file.updateStatus('done')
                when 200
                    response = JSON.parse(this.responseText)
                    file.isUserOwned = true
                    file.hash = response['hash']
                    file.isHashed = true
                    file.updateStatus('pending')
            if error?
                callback({ error: error }) if callback
            else
                callback({ file: file }) if callback
        formData = new FormData()
        formData.append('file', file.file)
        xhr.send(formData)

    self.uploadUrl = (file, callback) ->
        xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload/url')
        file.updateStatus('uploading')
        file.preview.querySelector('.progress').style.width = '100%'
        xhr.onload = ->
            switch this.status
                when 400
                    error = "This URL is not valid."
                when 404
                    error = "That URL does not exist, so far as we can tell."
                when 409
                    response = JSON.parse(this.responseText)
                    file.isUserOwned = false
                    file.hash = response['hash']
                    file.isHashed = true
                    file.updateStatus('done')
                when 413
                    error = "This file is too large."
                when 415
                    error = "This filetype is not supported."
                when 420
                    error = "You're uploading too much! Try again later."
                when 200
                    response = JSON.parse(this.responseText)
                    file.isUserOwned = true
                    file.hash = response['hash']
                    file.isHashed = true
                    file.updateStatus('pending')
            if error
                callback({ file: file, error: error }) if callback
            callback({ file: file }) if callback
        formData = new FormData()
        formData.append('url', file.file)
        xhr.send(formData)

    self.checkExists = (file, callback) ->
        xhr = new XMLHttpRequest()
        xhr.open('GET', "/api/#{file.hash}/exists")
        xhr.onload = ->
            response = JSON.parse(this.responseText)
            callback(response.exists) if callback
        xhr.send()

    self.checkStatus = (files, callback) ->
        xhr = new XMLHttpRequest()
        xhr.open('GET', "/api/status?list=#{files}")
        xhr.onload = ->
            response = JSON.parse(this.responseText)
            callback(response) if callback
        xhr.send()

    self.deleteFile = (file) ->
        xhr = new XMLHttpRequest()
        xhr.open('DELETE', "/api/#{file}")
        xhr.send()
        UserHistory.remove(file)

    self.setFlags = (file, flags) ->
        xhr = new XMLHttpRequest()
        formData = new FormData()
        formData.append(flag, value) for flag, value of flags
        xhr.open('POST', "/api/#{file}/flags")
        xhr.send(formData)

    self.createAlbum = (files, callback) ->
        xhr = new XMLHttpRequest()
        formData = new FormData()
        formData.append('list', files.join(','))
        xhr.open('POST', '/api/album/create')
        xhr.onload = ->
            if this.status isnt 200
                callback({ error: true }) if callback
            result = JSON.parse(this.responseText)
            if result.error?
                callback({ error: true }) if callback
            callback({ hash: result.hash }) if callback
        xhr.send(formData)
    
    self.zipAlbum = (hash, callback) ->
        xhr = new XMLHttpRequest()
        formData = new FormData()
        formData.append('hash', hash)
        xhr.open('POST', '/api/album/zip')
        xhr.onload = ->
            if this.status isnt 200
                callback({ error: true }) if callback
            result = JSON.parse(this.responseText)
            if result.error?
                callback({ error: true }) if callback
            callback(result) if callback
        xhr.send(formData)

    self.reportFile = (file) ->
        xhr = new XMLHttpRequest()
        xhr.open('POST', "/report/#{window.filename}")
        xhr.send()

    self.setText = (hash, title, description, callback) ->
        xhr = new XMLHttpRequest()
        formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        xhr.open('POST', "/api/#{hash}/text")
        xhr.onload = ->
            callback(self) if callback
        xhr.send(formData)

    return self
)()
window.API = API if window?
