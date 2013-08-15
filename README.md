# mediacrush

A website for serving media super fast, by [SirCmpwn](https://github.com/SirCmpwn) and [jdiez](https://github.com/jdiez17),
and several [other contributors](https://github.com/MediaCrush/MediaCrush/graphs/contributors).

https://mediacru.sh

MediaCrush runs on the following things:

* Linux!
* Python!
* ffmpeg
* jhead
* tidy
* redis
* flask-classy

This list grows as we find more cool tech to make media smaller.

## Developer Docs

If you aren't looking to contribute, but just want to do some cool stuff with the site, you might be interested in our
[Developer Documentation](https://mediacru.sh/docs), which documents our API and a few other nice things.

## Versioning

MediaCrush uses semantic versioning. In a nutshell: vMAJOR.MINOR.PATCH. Major increments for breaking changes, minor
increments for new, backwards-compatible features, and patch increments for backwards-compatible bug fixes or refactoring.
Check the latest git tag to see which version is the latest.

## Contributing

See [CONTRIBUTING.md](https://github.com/MediaCrush/MediaCrush/blob/master/CONTRIBUTING.md).

Also join our [IRC channel](http://webchat.freenode.net/?channels=mediacrush&uio=d4) to listen in on (and participate
in) dev chatter. It's #mediacrush on irc.freenode.net, if you already have a client.

## Installation

Install the requirements:

    sudo apt-get install redis-server jhead tidy

Install ffmpeg (you'll need to compile from source if the ffmpeg version in your repos is outdated):

Note: you'll need libtheora enabled to output ogv files.

    mkdir /tmp/ffmpeg
    git clone --depth 1 git://source.ffmpeg.org/ffmpeg.git /tmp/ffmpeg
    cd /tmp/ffmpeg
    ./configure --enable-libtheora --enable-libx264 --enable-gpl
    make
    sudo make install

Pull the repository to a folder:

    git clone http://github.com/MediaCrush/MediaCrush /home/service/webapps/mediacrush

Create a virtual environment:

Note: you'll need to use python2. If python3 is your default python interpreter, add `"--python=python2"` to the `virtualenv` command.

    virtualenv /home/service/webapps/mediacrush --no-site-packages

Go to the folder you created and activate the virtual environment:

    cd /home/services/webapps/mediacrush
    source bin/activate

Install the Python modules:

    pip install -r requirements.txt

Review the config.ini.sample file and rename it as config.ini.

Make the storage directory:

    mkdir storage

Make sure the redis daemon is running, and if everything went according to plan, you can now run the development server with debug capabilities by executing:

    python app.py

If you plan to host the service in a more robust fashion, consider using gunicorn. Run it as such:

    gunicorn -w 4 app:app

You will also need to have the daemon running in order to process files. To do this, execute:

    python daemon.py
