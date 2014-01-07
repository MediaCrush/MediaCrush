trackedFiles = {}

self.addEventListener('message', (e) ->
    switch e.data.action
        when 'compute-hash'
            computeHash(e.data)
        when 'monitor-status'
            monitor(e.data.hash)
, false)

computeHash = (e) ->
    hash = btoa(rstr_md5(e.data)).substr(0, 12)
    hash = hash.replace(/\+/g, '-')
    hash = hash.replace(/\//g, '_')
    self.postMessage({
        execute: "#{ e.callback }('#{ e.id }', '#{ hash }')"
    })

monitor = (e) ->
    trackedFiles[e] = {
        hash: e,
        status: 'pending'
    }
    if Object.keys(trackedFiles).length == 1
        setTimeout(updateMonitoredFiles, 1000)

updateMonitoredFiles = ->
    _ = []
    for f, v of trackedFiles
        _.push(f)
    API.checkStatus(_.join(','), (result) ->
        for hash, item of result
            if trackedFiles[hash].status != item.status
                trackedFiles[hash].status = item.status
                self.postMessage({ event: 'file-status-change', hash: hash, status: item.status, file: item.file })
                if item.status not in [ 'preparing', 'uploading', 'pending', 'processing', 'ready' ]
                    delete trackedFiles[hash]
        if Object.keys(trackedFiles).length > 0
            setTimeout(updateMonitoredFiles, 1000)
    )
