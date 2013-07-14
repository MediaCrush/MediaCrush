gifquick
========

A website for serving GIFs super fast. 

Installation
============

Install the redis server:
    sudo apt-get install redis-server

Install ffmpeg (you'll need to compile from source if the ffmpeg version in your repos is outdated):
Note: you'll need libtheora enabled to output ogv files.

    mkdir /tmp/ffmpeg
    git clone git://source.ffmpeg.org/ffmpeg.git /tmp/ffmpeg
    cd /tmp/ffmpeg
    ./configure --enable-libtheora
    make
    sudo make install

Pull the repository to a folder:
    git pull http://github.com/GifQuick/GifQuick /home/service/webapps/gifquick

Create a virtual environment:
Note: you'll need to use python2. If python3 is your default python interpreter, add "--python=python2" to the `virtualenv` command.
    virtualenv /home/service/webapps/gifquick --no-site-packages

Go to the folder you created and activate the virtual environment:
    cd /home/services/webapps/gifquick
    source bin/activate

Install the Python modules:
    pip install -r requirements.txt

If everything went according to plan, you can now run the development server with debug capabilities by executing:
    python app.py

If you plan to host the service in a more robust fashion, consider using gunicorn. Run it as such:
    gunicorn -w 4 app:app

You will also need to have the daemon running in order to process files. To do this, execute:
    python daemon.py
