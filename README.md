# mediacrush

A website for serving media super fast. 

## Installation

Install the requirements:

    sudo apt-get install redis-server jhead tidy

Install ffmpeg (you'll need to compile from source if the ffmpeg version in your repos is outdated):

Note: you'll need libtheora enabled to output ogv files.

    mkdir /tmp/ffmpeg
    git clone git://source.ffmpeg.org/ffmpeg.git /tmp/ffmpeg
    cd /tmp/ffmpeg
    ./configure --enable-libtheora --enable-x264 --enable-gpl
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

If everything went according to plan, you can now run the development server with debug capabilities by executing:

    python app.py

If you plan to host the service in a more robust fashion, consider using gunicorn. Run it as such:

    gunicorn -w 4 app:app

You will also need to have the daemon running in order to process files. To do this, execute:

    python daemon.py

## Development

The master branch is a copy of the production site. As such, please submit any pull requests in their own feature
branch. All of our development happens like that, too. Follow the coding standards we're already using with your
own pull requests.
