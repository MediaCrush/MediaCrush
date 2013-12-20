EXTENSIONS = {
    # "application/pdf": "pdf",
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    # "text/plain": "txt",
    "video/mp4": "mp4",
    "video/ogg": "ogv",
    "video/webm": "webm",
}

extension = lambda f: f.rsplit('.', 1)[1].lower()

def get_mimetype(url):
    ext = extension(url) if "." in url else url
    for k, v in EXTENSIONS.items():
        if v == ext:
            return k
