#!/bin/bash
sudo apt-get update -qq
sudo apt-get install -qq imagemagick tidy libjpeg-progs optipng libmp3lame-dev nodejs \
  autoconf automake build-essential git libass-dev libgpac-dev \
  libsdl1.2-dev libtheora-dev libtool libva-dev libvdpau-dev libvorbis-dev libx11-dev \
  libxext-dev libxfixes-dev pkg-config texi2html zlib1g-dev libvpx-dev libx264-dev

git clone --depth 1 git://source.ffmpeg.org/ffmpeg
git clone --depth 1 git://git.code.sf.net/p/opencore-amr/fdk-aac
wget https://github.com/yasm/yasm/archive/v1.2.0.tar.gz
tar zxf v1.2.0.tar.gz

cd yasm-1.2.0
./autogen.sh
./configure
make
sudo make install
cd ..

cd fdk-aac
autoreconf -fiv
./configure --disable-shared
make
sudo make install
cd ..

cd ffmpeg
git checkout tags/n2.1.3
./configure --enable-gpl --enable-nonfree --enable-libfdk_aac --enable-libtheora --enable-libvorbis --enable-libx264 --enable-libvpx --enable-libmp3lame
make
sudo make install
cd ..

ffmpeg --version
x264 --version
yasm --version
