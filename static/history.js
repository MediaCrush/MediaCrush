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
