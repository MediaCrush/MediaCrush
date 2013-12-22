class MediaFile
    constructor: (file) ->
        @name = file.name
        @status = 'none'
    
    updateStatus: (status) ->
        @status = status
        @preview.querySelector('.status').textContent = switch status
            when 'preparing' then "Preparing..."
            when 'uploading' then "Uploading..."
            when 'pending' then "Waiting to process..."
            when 'processing' then "Processing..."
            when 'done' then "Upload complete!"

window.MediaFile = MediaFile
window.uploadedFiles = []
