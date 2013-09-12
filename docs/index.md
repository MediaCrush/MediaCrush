# Developer Documentation

MediaCrush offers a free API to developers that allows you to upload media and retrieve information on files
on our servers. This API is completely free, but we appriciate a [donation](/donate) if you plan to use it,
since we don't get any ad views from API users. We also appreciate that donation if you hotlink to us often.

Documentation for our API is provided [here](/docs/API).

## Blob Identifiers

We use MD5 hashes* to identify a media blob, which is a collection of files that make up one "media" object.
This hash comes from the originally uploaded file, and is base 64 encoded, with `+` replaced by `-`, and `/`
replaced with `_`. In other words, to get the blob identifier of a file:
`base64(md5(file)).replace('+', '-').replace('/', '_')`. This identifier is the URL at which the file appears
when uploaded - `/identifier`.

\* Before you cry "security!", realize that MD5 is fine for checksums and we aren't actually using them to
protect sensitive information.

## Embedding Media

It's possible to embed MediaCrush files in your own page. It's actually quite simple. For a given MediaCrush
URL (i.e. [https://mediacru.sh/6-5E-TOqYQAr](https://mediacru.sh/6-5E-TOqYQAr)), place the following script
wherever you'd like the media to show up:

    <script type="text/javascript" src="https://mediacru.sh/6-5E-TOqYQAr/embed"></script>

This script will insert the following markup after the script tag:

    <div class="mediacrush-embed" data-id="6-5E-TOqYQAr" data-type="image/jpeg">
        <img src="https://mediacru.sh/6-5E-TOqYQAr.jpg" />
    </div>

Note that `data-type` is the original type of the uploaded image. Embedded gifs will be embedded as HTML5
video, but still show `data-type="image/gif"`. Additionally, other media may actually contain several files
of different types - for example, videos will include `video/mp4` and `video/ogv` files, regardless of the
original file type.

You can also manually embed media by just taking the generated markup and dropping it into your page, which
avoids the need to load our script. It's also possible to get information about media through the API (in the
form of JSON blobs), and then generate markup yourself based on the results.

## API Wrappers

We're working on a few API wrappers of our own, but they are not ready yet. If you make a cool one, feel
free to shoot us an [email](mailto:admin@mediacru.sh) and we'll mention it here.
