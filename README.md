# MediaCrush

A website for serving media super fast, by [SirCmpwn](https://github.com/SirCmpwn) and [jdiez](https://github.com/jdiez17), and several [other contributors](https://github.com/MediaCrush/MediaCrush/graphs/contributors).

https://mediacru.sh

What is this?
It's a website you can upload images, audio, and video to, and receive a link to share it with your friends.
This readme documents contributor guidelines and installation instructions.
For information on the official MediaCrush instance, see https://mediacru.sh/about

Support us on Gratipay? https://gratipay.com/mediacrush/

## Developer Docs

If you aren't looking to contribute, but just want to do some cool stuff with the site, you might be interested in our [developer documentation](https://mediacru.sh/docs), which documents our API and a few other nice things.

## Contributing

See [CONTRIBUTING.md](https://github.com/MediaCrush/MediaCrush/blob/master/CONTRIBUTING.md).
To get started, join our our [IRC channel](http://webchat.freenode.net/?channels=mediacrush&uio=d4) (#mediacrush on irc.freenode.net) to listen in on dev chatter.
We can help you sort out your ideas and we'll work with you directly to fine tune your pull requests.

## Installation

Here's a quick overview of installation:

1. Install Python 2, virtualenv, redis, ffmpeg, tidy, jhead, node.js, and optipng.
2. Clone the MediaCrush git repository.
3. Activate the virtualenv.
4. Install pip requirements.
5. Install coffeescript.
6. Configure MediaCrush.
7. Start the services and you're done!

Your mileage may vary, be prepared to deal with unforeseen complications.

Here it is again, in more detail.

**Install the requirements**

Our servers and our dev machines both run Arch Linux, which makes getting updated packages a little easier.
We need to install a few things: 

    sudo pacman -S redis imagemagick python2 python-virtualenv nodejs
    
You also need to install `ffmpeg-full` from the AUR.
Feel free to modify the PKGBUILD a little bit to suit your environment - you probably don't need x11grab, for example.
If you aren't on Arch Linux, you should be able to use your distribution packages, with the exception of ffmpeg, which you *must* compile yourself.
Make sure you enable `libtheora`, `libvorbis`, `libx264`, `libfdk_aac`, and `libvpx` when you configure it.

Optional dependencies:

* *jpegtran* for JPG support - via [extra/libjpeg-turbo](https://www.archlinux.org/packages/extra/x86_64/libjpeg-turbo/)
* *optipng* for PNG support
* *tidyhtml* for SVG support
* *xcftools* for XCF support
* *otfinfo* for subtitle support - via [extra/texlive-bin](https://www.archlinux.org/packages/extra/x86_64/texlive-bin/)

On Mac OS X you can use [Homebrew](http://brew.sh/) to install ffmpeg w/ the requisite add-ons:

    brew install ffmpeg --with-theora --with-libvorbis --with-fdk-aac --with-libvpx

**Clone the repository**

    git clone http://github.com/MediaCrush/MediaCrush && cd MediaCrush

**Create a virtual environment**

Note: you'll need to use Python 2. If Python 3 is your default python interpreter (`python --version`), add `--python=python2` to the `virtualenv` command.

    virtualenv . --no-site-packages

**Activate the virtualenv**

    source bin/activate

**Install pip requirements**

    pip install -r requirements.txt

**Install coffeescript**

    npm install -g coffee-script

**Configure MediaCrush**

    cp config.ini.sample config.ini

Review `config.ini` and change any details you like.
The default place to store uploaded files is `./storage`, which you'll need to create (`mkdir storage`) and set the `storage_folder` variable in the config to an absolute path to this folder.

**Compile static files**

If you make a change to any of the scripts, you will need to run the `compile_static.py` script.

    python compile_static.py

**Start the services**

You'll want to make sure Redis is running at this point.
It's probably best to set it up to run when you boot up the server (`systemctl enable redis.service` on Arch).

MediaCrush requires the daemon and the website to be running concurrently to work correctly.
The website is `app.py`, and the daemon is celery.
The daemon is responsible for handling media processing.
Run the daemon, then the website:

    celery worker -A mediacrush -Q celery,priority
    python app.py

This runs the site in debug mode.
If you want to run this on a production server, you'll probably want to run it with gunicorn, and probably behind an nginx proxy [like we do](https://github.com/MediaCrush/MediaCrush/blob/master/config/nginx.conf).

    gunicorn -w 4 app:app

## Tests

To run the unit tests, simply execute `python tests.py`.

Note: do **not** execute the test script on a live instance - it clears the storage and database.

## Updating your Instance

Updating a MediaCrush instance isn't pretty.
We don't have a great mechanism in place for handling breaking changes.
However, we will be posting to the mediacrush@librelist.com mailing list whenever we push noteworthy changes.
Send an email to that address to subscribe to the list.
Anyone who runs a third-party MediaCrush instance should be on that list.
Feel free to send any questions related to maintaining your instance as well, but be sure to browse the [archives](http://librelist.com/browser/mediacrush) first.
