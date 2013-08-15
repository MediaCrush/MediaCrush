(function(xhr) {
    var open = XMLHttpRequest.prototype.open;
    xhr.prototype.open = function() {
        open.apply(this, arguments);
        this.setRequestHeader('X-Requested-With','XMLHttpRequest');
    };
})(XMLHttpRequest);
