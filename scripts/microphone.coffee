if not navigator.getUserMedia
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
window.AudioContext = window.AudioContext || window.webkitAudioContext

recording = false
mediaStream = null
audioContext = null
record = null
info = null
window.addEventListener('DOMContentLoaded', ->
    record = document.getElementById('record').querySelector('.record')
    info = document.getElementById('record').querySelector('.info')
    if navigator.getUserMedia
        audioContext = new AudioContext()
        document.getElementById('record').classList.remove('hidden')
        record.addEventListener('click', (e) ->
            e.preventDefault()
            if recording
                stopRecording()
            else
                record.setAttribute('data-icon', '\uF16A')
                info.textContent = 'Recording...'
                info.classList.remove('hidden')
                if mediaStream != null
                    backgroundWorker.postMessage({ action: 'initialize-audio' })
                    recording = true
                else
                    navigator.getUserMedia({ audio: true }, (e) ->
                        mediaStream = e
                        gotMedia()
                        recording = true
                    , (e) ->
                        info.classList.remove('hidden')
                        record.classList.add('hidden')
                        info.textContent = 'An error occured.'
                    , false)
        , false)
, false)

gotMedia = (e) ->
    volume = audioContext.createGain()
    input = audioContext.createMediaStreamSource(mediaStream)
    input.connect(volume)

    bufferSize = 2048
    if audioContext.createScriptProcessor?
        recorder = audioContext.createScriptProcessor(bufferSize, 2, 2)
    else
        recorder = audioContext.createJavaScriptNode(bufferSize, 2, 2)
    sampleRate = volume.context.sampleRate
    recorder.onaudioprocess = (e) ->
        return if not recording
        left = e.inputBuffer.getChannelData 0
        right = e.inputBuffer.getChannelData 1
        backgroundWorker.postMessage({ action: 'push-audio', left: new Float32Array(left), right: new Float32Array(right) })
    volume.connect(recorder)
    recorder.connect(audioContext.destination)

    backgroundWorker.postMessage({ action: 'initialize-audio', sampleRate: sampleRate })

stopRecording = ->
    recording = false
    record.setAttribute('data-icon', '\uF141')
    info.textContent = 'Processing...'
    backgroundWorker.postMessage({ action: 'finish-audio', callback: 'audioDone' })

window.audioDone = (blob) ->
    blob.name = 'Microphone'
    window.handleFiles([ blob ])
    info.classList.add('hidden')
    record.setAttribute('data-icon', '\uF073')
