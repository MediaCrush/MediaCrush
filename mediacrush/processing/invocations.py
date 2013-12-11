from mediacrush.processing.invocation import Invocation

# General invocations
copy = Invocation("cp {0} {1}")

# Video-related invocations
mp4 = Invocation("ffmpeg -i {0} -vcodec libx264 -pix_fmt yuv420p -vf scale=trunc(in_w/2)*2:trunc(in_h/2)*2 {1}.mp4")
webm = Invocation("ffmpeg -i {0} -c:v libvpx -c:a libvorbis -pix_fmt yuv420p -quality good -b:v 2M -crf 5 {1}.webm")
ogv = Invocation("ffmpeg -i {0} -q 5 -pix_fmt yuv420p -acodec libvorbis -vcodec libtheora {1}.ogv")
mp3 = Invocation("ffmpeg -i {0} {1}.mp3")
ogg = Invocation("ffmpeg -i {0} -acodec libvorbis {1}.ogg")
png_frame = Invocation("ffmpeg -i {0} -vframes 1 {1}.png")

# Image-related invocations
jpeg = Invocation("jhead -purejpg {0} {0}")
svg = Invocation("tidy -asxml -xml --hide-comments 1 --wrap 0 --quiet --write-back 1 {0}")
png_still = Invocation("optipng -o5 {0}")
