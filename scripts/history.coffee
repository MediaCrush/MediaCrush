window.UserHistory = new (->
    self = this

    userHistory = []
    historyEnabled = true
    
    self.getHistory = -> userHistory
    self.getHistoryEnabled = -> historyEnabled

    historyEnabled = readCookie('hist-opt-out') == null
    userHistory = JSON.parse(window.localStorage.getItem('history'))
    userHistory = [] if not userHistory

    self.save = ->
        window.localStorage.setItem('history', JSON.stringify(userHistory))

    self.add = (hash) ->
        return unless historyEnabled
        for item in userHistory
            return item if item == hash
        userHistory.push(hash)
        self.save()

    self.clear = ->
        userHistory = []
        self.save()

    self.remove = (hash) ->
        for i in [0 .. userHistory.length]
            if userHistory[i] == hash
                userHistory.splice(i, 1)
                break
        self.save()

    self.toggleHistoryEnabled = ->
        if historyEnabled
            createCookie('hist-opt-out', '1', 3650)
        else
            createCookie('hist-opt-out', '', 0)
        historyEnabled = !historyEnabled
        return historyEnabled

    self.loadDetailedHistory = (items, callback) ->
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

    return self
)()
