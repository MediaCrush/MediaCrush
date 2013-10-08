<script>
    {% if mimetype.startswith("video") or mimetype.startswith("audio") %}
        window.addEventListener('load', function() {
            var tagname = {% if mimetype.startswith("video") %}"video"{% else %}"audio"{%endif %};
            var player = document.getElementsByTagName(tagname)[0];
            if (window.localStorage && localStorage.volume) 
                player.volume = parseFloat(localStorage.volume);

            if (window.localStorage) {
                player.addEventListener('volumechange', function() {
                    localStorage.volume = player.volume;
                });
            }
        });
    {% endif %}
</script>
