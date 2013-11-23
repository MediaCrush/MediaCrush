var history = [];
var historyEnabled = true;
function loadHistory() {
    historyEnabled = readCookie('hist-opt-out') === null;
    history = JSON.parse(window.localStorage.getItem('history'));
    if (!history) {
        history = [];
    }
}
function saveHistory() {
    window.localStorage.setItem('history', JSON.stringify(history));
}
function addItemToHistory(hash) {
    if (!historyEnabled)
        return;
    for (var i = 0; i < history.length; i++) {
        if (history[i] === hash)
            return;
    }
    history.push(hash);
    saveHistory();
}
function clearHistory() {
    if (!window.localStorage)
        return;
    history = [];
    window.localStorage.setItem('history', JSON.stringify(history));
}
function removeItemFromHistory(hash) {
    for (var i = 0; i < history.length; i++) {
        if (history[i] == hash) {
            history.remove(i);
            break;
        }
    }
    saveHistory();
}
function loadDetailedHistory(items, callback) {
    if (items.length == 0) callback([]);
    var hashes = items.join(',');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/info?list=' + hashes);
    xhr.onload = function() {
        if (xhr.status != 200) {
            var itemsElement = document.getElementById('items');
            itemsElement.innerHTML = 'There was an error showing your history, sorry.';
            return;
        }
        var result = JSON.parse(this.response);
        if (callback) callback(result);
    };
    xhr.send();
}
