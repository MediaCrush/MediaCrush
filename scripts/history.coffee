history = []
historyEnabled = true
window.getHistory = -> history
window.getHistoryEnabled = -> historyEnabled

loadHistory = ->
    historyEnabled = readCookie('hist-opt-out') == null
    history = JSON.parse(window.localStorage.getItem('history'))
    history = [] if not history
window.loadHistory = loadHistory

saveHistory = ->
    window.localStorage.setItem('history', JSON.stringify(history))
window.saveHistory = saveHistory

addItemToHistory = (hash) ->
    return unless historyEnabled
    for item in history
        return item if item == hash
    history.push(hash)
    saveHistory()
window.addItemToHistory = addItemToHistory

clearHistory = ->
    history = []
    saveHistory()
window.clearHistory = clearHistory

removeItemFromHistory = (hash) ->
    for i in [0 .. history.length]
        if history[i] == hash
            history.remove(i)
            break
    saveHistory()
window.removeItemFromHistory = removeItemFromHistory

removeHistoryAt = (index) ->
    history.remove(index)
    saveHistory()
window.removeHistoryAt = removeHistoryAt

toggleHistoryEnabled = ->
    if historyEnabled
        createCookie('hist-opt-out', '1', 3650)
    else
        createCookie('hist-opt-out', '', 0)
    historyEnabled = !historyEnabled
window.toggleHistoryEnabled = toggleHistoryEnabled

loadDetailedHistory = (items, callback) ->
    callback([]) if items.length == 0
    hashes = items.join(',')
    xhr = new XMLHttpRequest()
    xhr.open('GET', '/api/info?list=' + hashes)
    xhr.onload = ->
        if xhr.status != 200
            document.getElementById('items').innerHTML = 'There was an error showing your history, sorry.'
            return
        if callback
            callback(JSON.parse(this.response))
    xhr.send()
window.loadDetailedHistory = loadDetailedHistory
