tweakXHR = (xhr) ->
    open = XMLHttpRequest.prototype.open
    xhr.prototype.open = () ->
        open.apply(this, arguments)
        this.setRequestHeader('X-Requested-With','XMLHttpRequest')
tweakXHR(XMLHttpRequest)
