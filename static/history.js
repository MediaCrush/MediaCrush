Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "; expires=Thu, 01-Jan-1970 00:00:01 GMT";
    document.cookie = name+"="+value+expires+"; path=/";
}
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
