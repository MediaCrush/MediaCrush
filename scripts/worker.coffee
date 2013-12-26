trackedFiles = {}

self.addEventListener('message', (e) ->
    switch e.data.action
        when 'compute-hash'
            computeHash(e.data)
        when 'monitor-status'
            monitor(e.data.hash)
, false)

computeHash = (e) ->
    hash = btoa(rstr_md5(e.data)).substr(0, 12).replace('+', '-', 'g').replace('/', '_', 'g')
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
                if item.status == 'done'
                    self.postMessage({ event: 'file-status-change', hash: hash, status: item.status, result: item })
                    delete trackedFiles[hash]
                else
                    self.postMessage({ event: 'file-status-change', hash: hash, status: item.status })
        if Object.keys(trackedFiles).length > 0
            setTimeout(updateMonitoredFiles, 1000)
    )
