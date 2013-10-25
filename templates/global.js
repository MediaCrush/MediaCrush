{% if mobile %}
window.mobile = true;
{% else %}
window.mobile = false;
{% endif %}
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
function adOptOut() {
    createCookie('ad-opt-out', '1', 3650); // 3650 days is 10 years, which isn't forever, but is close enough
    var gad = document.getElementById('gad');
    var lgad = document.getElementById('lgad');
    if (gad) {
        gad.innerHTML = "You won't see any ads again. If you regret it, head over to the <a href='/donate'>donation</a> page, where you can opt-in.";
    }
    if (lgad) {
        lgad.innerHTML = "You won't see any ads again. If you regret it, head over to the <a href='/donate'>donation</a> page, where you can opt-in.";
    }
}
function switchTheme() {
    if (readCookie('dark_theme'))
        createCookie('dark_theme', '', -1);
    else
        createCookie('dark_theme', '1', 3650);
    window.location.href = window.location.href;
}
window.addEventListener('load', function() {
    var feedback = document.getElementById('feedback').querySelector('div');
    var feedbackToggle = document.getElementById('toggle-feedback');
    if (feedbackToggle) {
        feedbackToggle.addEventListener('click', function(e) {
            e.preventDefault();
            if (e.target.parentElement.className.indexOf('active') == -1) {
                e.target.parentElement.classList.add('active');
                feedback.querySelector('textarea').focus();
            } else {
                e.target.parentElement.classList.remove('active');
            }
        }, false);
    }
    var feedbackSend = document.getElementById('send-feedback');
    if (feedbackSend) {
        feedbackSend.addEventListener('click', function(e) {
            e.preventDefault();
            // TODO
            feedback.innerHTML = "<p>Thanks! We'll have a look. Feel free to <a href='mailto:support@mediacru.sh'>email us</a> if need some help.</p>";
        }, false);
    }
}, false);
