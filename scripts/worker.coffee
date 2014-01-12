trackedFiles = {}
audio = {
    left: [],
    right: [],
    length: 0,
    sampleRate: 0
}

self.addEventListener('message', (e) ->
    switch e.data.action
        when 'compute-hash'
            computeHash(e.data)
        when 'monitor-status'
            monitor(e.data.hash)
        when 'initialize-audio'
            initializeAudio(e.data)
        when 'push-audio'
            pushAudio(e.data)
        when 'finish-audio'
            finishAudio(e.data)
, false)

initializeAudio = (e) ->
    if not e.sampleRate?
        e.sampleRate = audio.sampleRate
    audio = {
        left: [],
        right: [],
        length: 0,
        sampleRate: e.sampleRate
    }

pushAudio = (e) ->
    audio.left.push(e.left)
    audio.right.push(e.right)
    audio.length += e.left.length

finishAudio = (e) ->
    left = mergeBuffers(audio.left, audio.length)
    right = mergeBuffers(audio.right, audio.length)
    interleaved = interleave(left, right)
    wav = encodeWAV(interleaved)
    blob = new Blob([wav], { type: 'audio/x-wav' })
    self.postMessage({
        execute: "#{ e.callback }(e.data.data)",
        data: blob
    })

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

mergeBuffers = (buffers, length) ->
    result = new Float32Array(length)
    offset = 0
    for buffer in buffers
        result.set(buffer, offset)
        offset += buffer.length
    return result

interleave = (left, right) ->
    length = left.length + right.length
    result = new Float32Array(length)
    i = 0
    j = 0
    while i < length
        result[i++] = left[j]
        result[i++] = right[j]
        j++
    return result

writeString = (view, offset, string) ->
    for i in [0..string.length]
        view.setUint8(offset + i, string.charCodeAt(i))

encodeWAV = (samples) ->
    buffer = new ArrayBuffer(44 + samples.length * 2)
    view = new DataView(buffer)
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 32 + samples.length * 2, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 2, true)
    view.setUint32(24, audio.sampleRate, true)
    view.setUint32(28, audio.sampleRate * 4, true)
    view.setUint16(32, 4, true)
    view.setUint16(34, 16, true)
    writeString(view, 36, 'data')
    view.setUint32(40, samples.length * 2, true)
    floatTo16BitPCM(view, 44, samples)
    return view
`
function floatTo16BitPCM(output, offset, input) {
    for (var i = 0; i < input.length; i++, offset+=2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}
`
