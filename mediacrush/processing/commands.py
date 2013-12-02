from mediacrush.processing.utils import Invocation

mp4 = Invocation("fffmpeg -i {0} -vcodec libx264 -pix_fmt yuv420p -vf scale=trunc(in_w/2)*2:trunc(in_h/2)*2 {1}.mp4")
webm = Invocation("ffmpeg -i {0} -c:v libvpx -c:a libvorbis -pix_fmt yuv420p -quality good -b:v 2M -crf 5 {1}.webm")
