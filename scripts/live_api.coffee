a.addEventListener('click', (e) ->
    e.preventDefault()

    parent = e.target.parentElement.parentElement
    method = parent.dataset.method
    endpoint = parent.dataset.endpoint
    response = parent.querySelector('.response')
    response.textContent = ''

    inputs = parent.querySelectorAll('input')
    formData = new FormData()
    for input in inputs
        if endpoint.indexOf('{ ' + input.name + ' }') != -1
            regex = new RegExp("{ #{ input.name} }")
            endpoint = endpoint.replace(regex, input.value)
        else
            if input.type == 'file'
                formData.append(input.name, input.files[0])
                response.textContent += "#{ input.name }=(file)\n"
            else if input.type == 'button'
                # pass
            else
                formData.append(input.name, input.value)
                response.textContent += "#{ input.name }=#{ input.value }\n"

    response.textContent = method + ' ' + endpoint + '\n' + response.textContent

    xhr = new XMLHttpRequest()
    xhr.open(method, endpoint)

    load = ->
        response.textContent += '\n'
        response.textContent += "HTTP #{ xhr.status } #{ xhr.statusText }\n"
        response.textContent += xhr.responseText

    xhr.onload = load
    xhr.onerror = load

    if method == 'POST'
        xhr.send(formData)
    else
        xhr.send()
, false) for a in document.querySelectorAll('.tester .submit')

document.getElementById('userToken').textContent = readCookie('userToken')
