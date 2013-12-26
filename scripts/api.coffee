API = (->
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
                when 209
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
                callback({ error: error })
            else
                callback({ file: file }) if callback
        formData = new FormData()
        formData.append('file', file.file)
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

    return self
)()
window.API = API if window?
