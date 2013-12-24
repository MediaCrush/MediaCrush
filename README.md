# MediaCrush

A website for serving media super fast, by [SirCmpwn](https://github.com/SirCmpwn) and
[jdiez](https://github.com/jdiez17), and several
[other contributors](https://github.com/MediaCrush/MediaCrush/graphs/contributors).

https://mediacru.sh

What is this? It's a website you can upload images, audio, and video to, and receive a link to share it with your
friends. This readme documents contributor guidelines and installation instructions. For information on the official
MediaCrush instance, see https://mediacru.sh/about

## Developer Docs

If you aren't looking to contribute, but just want to do some cool stuff with the site, you might be interested in our
[developer documentation](https://mediacru.sh/docs), which documents our API and a few other nice things.

## Contributing

See [CONTRIBUTING.md](https://github.com/MediaCrush/MediaCrush/blob/master/CONTRIBUTING.md). To get started, join our
our [IRC channel](http://webchat.freenode.net/?channels=mediacrush&uio=d4) (#mediacrush on irc.freenode.net) to listen
in on dev chatter. We can help you sort out your ideas and we'll work with you directly to fine tune your pull requests.

## Installation

Here's a quick overview of installation:

1. Install Python 2, redis, ffmpeg, tidy, jhead, and optipng.
2. Clone the MediaCrush git repository.
3. Activate the virtualenv.
4. Install pip requirements.
5. Configure MediaCrush.
6. Start the services and you're done!

Here it is again, in more detail.

**Install the requirements**

Our servers run on Ubuntu, and you install the deps with `sudo apt-get install jhead redis-server tidy optipng`. The
Ubuntu repos have a poor distribution of [ffmpeg](http://ffmpeg.org), so you'll need to build that from source. Our
dev machines run Arch Linux: `sudo pacman -S redis jhead tidyhtml optipng ffmpeg imagemagick`. Make sure you enable libtheora,
libvorbis, libx264, and libvpx when you build ffmpeg. If you're on Arch, you might want ffmpeg-full from the AUR.

**Clone the repository**

    git clone http://github.com/MediaCrush/MediaCrush && cd MediaCrush

**Create a virtual environment**

Note: you'll need to use Python 2. If Python 3 is your default python interpreter (`python --version`), add
`"--python=python2"` to the `virtualenv` command.

    virtualenv . --no-site-packages

**Activate the virtualenv**

    source bin/activate

**Install pip requirements**

    pip install -r requirements.txt

**Configure MediaCrush**

    cp config.ini.sample config.ini

Review `config.ini` and change any details you like. The default place to store uploaded files is `./storage`,
which you'll need to create (`mkdir storage`) and set the `storage_folder` variable in the config to an absolute path to this folder.

**Start the services**

You'll want to make sure Redis is running at this point. It's probably best to set it up to run when you boot
up the server (`systemctl enable redis.service` on Arch).

MediaCrush requires the daemon and the website to be running concurently to work correctly. The website is
`app.py`, and the daemon is celery. The daemon is responsible for handling media processing. Run the
daemon, then the website:

    celery worker -A mediacrush
    python app.py

This runs the site in debug mode. If you want to run this on a production server, you'll probably want to
run it with gunicorn, and probably behind an nginx proxy
[like we do](https://github.com/MediaCrush/MediaCrush/blob/master/config/nginx.conf).

    gunicorn -w 4 app:app

## Tests

To run the unit tests, simply execute `python tests.py`.

Note: do **not** execute the test script on a live instance - it clears the storage and database.
