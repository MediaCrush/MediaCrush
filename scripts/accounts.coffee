createData = ->
    data = {
        version: 1,
        lastSync: new Date().getTime(),
        history: [],
        trackHistory: true,
        username: null,
        userhash: null,
        passwordhash: null,
        synced: false,
        token: null
    }
    old = window.localStorage.getItem('history')
    if old
        data.history = JSON.parse(old)
        data.trackHistory = readCookie('hist-opt-out') == null
        if not data.trackHistory
            createCookie('hist-opt-out', '', 0)
        window.localStorage.removeItem('history')
    generateToken = ->
        return if not data.token == null
        data.token = '' # TODO
    if sjcl.random.isReady() > 0
        generateToken()
    else
        slcl.random.addEventListener('seeded', generateToken)
    return data

upgrade = (data) ->
    if data.version < 1
        return initializeData()
    # Nothing to do here

window.testDowngrade = ->
    window.localStorage.setItem('history', JSON.stringify(CryptoStorage.get('history')))
    window.localStorage.removeItem('CryptoStorage.data')
window.CryptoStorage = (->
    self = this

    sjcl.random.startCollectors()

    data = window.localStorage.getItem('CryptoStorage.data')
    targetVersion = 1
    if not data
        data = createData()
        window.localStorage.setItem('CryptoStorage.data', JSON.stringify(data))
    else
        data = JSON.parse(data)
    if data.version < targetVersion
        data = upgrade(data)
    #if data.synced
        # TODO: Try to pull new version from server

    self.commit = ->
        window.localStorage.setItem('CryptoStorage.data', JSON.stringify(data))
        return unless data.synced
        # TODO: Encrypt and push

    #self.register = (username, password) ->
        # TODO

    self.get = (key) ->
        return data[key]

    self.set = (key, value) ->
        console.log("set #{key} to #{JSON.stringify(value)}")
        data[key] = value

    return self
)()
