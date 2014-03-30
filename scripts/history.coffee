UserHistory = (->
    self = this

    userHistory = []
    
    self.getHistory = -> CryptoStorage.get('history')
    self.getHistoryEnabled = -> CryptoStorage.get('trackHistory')

    self.save = ->
        CryptoStorage.set('history', userHistory[..])
        CryptoStorage.commit()
        return

    self.add = (hash) ->
        return unless getHistoryEnabled()
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
        result = CryptoStorage.set('trackHistory', !getHistoryEnabled())
        CryptoStorage.commit()
        return result

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
window.UserHistory = UserHistory if window?
