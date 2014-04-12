# MediaCrush API

MediaCrush offers a public API that lets you do anything you could normally do on the
public site. It returns JSON on all methods and is somewhat RESTful.

MediaCrush also supports CORS for cross-origin requests. If you intend to use the
MediaCrush API from browser JavaScript, you will want to set the X-CORS-Status header
to 1. This is because browsers will errornously handle any request that returns a
non-2xx status code (which the MediaCrush API frequently does). If you set this header,
each response will include the X-Status HTTP header with the real status code.

TODO: Insert table of contents here

## Versioning

All API endpoints are at `/api/v{version}`. The current version is 2, so all endpoints
are scoped to `/api/v2`.

## User Tokens

When uploading a file, you should include a `userToken` cookie. This cookie should
have a randomly-generated value that is unique to you. You will need this value to edit
or delete files. If you lose this token, you can get it back by querying for your
account info.

Your userToken cookie is currently set to "<span id="userToken"></span>".

### /api/v2/upload

#### POST

Uploads a file to MediaCrush. There are two ways to use this endpoint. The first is to
upload a file directly:

<div class="tester" data-method="POST" data-endpoint="/api/v2/upload">
<pre class="response">$ curl -F file=@example.png https://mediacru.sh/api/v2/upload
{"hash": "..."}</pre>
    <div class="parameters">
        <input type="file" name="file" />
        <input type="button" class="submit" value="Submit"></button>
    </div>
</div>
<div class="clearfix"></div>

The second is to upload a URL:

<div class="tester" data-method="POST" data-endpoint="/api/v2/upload">
<pre class="response">$ curl -F url=http://example.com/example.png https://mediacru.sh/api/v2/upload
{"hash": "..."} </pre>
    <div class="parameters">
        <input type="text" name="url" placeholder="URL..." />
        <input type="button" class="submit" value="Submit"></button>
    </div>
</div>
<div class="clearfix"></div>

After upload, your file will not immediately be ready. You should query the file's
status and wait for it to switch to "ready". For more detail, see [uploading](#uploading).

### /api/v2/hash,hash,hash

This endpoint takes any number of media hashes and performs some operation on them.

#### GET

Returns [file objects](#file-objects) for the specified hashes.

<div class="tester" data-method="GET" data-endpoint="/api/v2/{ list }">
<pre class="response">$ curl https://mediacru.sh/api/v2/hash1,hash2,hash3
[
    { file object },
    { file object },
    { file object }
]</pre>
    <div class="parameters">
        <input type="text" name="list" placeholder="hash,hash,hash..." value="5HM9b5vnEHbU,U37IX05BI_5j,EM41XyYgaI65" />
        <input type="button" class="submit" value="Submit"></button>
    </div>
</div>
<div class="clearfix"></div>

#### DELETE

Deletes one or more file objects. You must include the `userToken` cookie.

<div class="tester" data-method="DELETE" data-endpoint="/api/v2/{ list }">
<pre class="response">$ curl -X DELETE https://mediacru.sh/api/v2/hash1,hash2,hash3
[
    {"result": "success", "hash": hash1},
    {"result": "not_found", "hash": hash2},
    {"result": "unauthorized", "hash": hash3}
]</pre>
    <div class="parameters">
        <input type="text" name="list" placeholder="hash,hash,hash..." value="5HM9b5vnEHbU,U37IX05BI_5j,EM41XyYgaI65" />
        <input type="button" class="submit" value="Submit"></button>
    </div>
</div>
<div class="clearfix"></div>

#### POST

Updates editable properties on file objects. Your POST body should be a JSON string
with the properties set as you would like them to be.

<div class="tester" data-method="POST" data-endpoint="/api/v2/{ list }">
<pre class="response">$ curl -F '[{"flags": {"loop": true}}, ...]' https://mediacru.sh/api/v2/hash1,hash2,hash3
[
    { file object },
    { file object },
    { file object }
]</pre>
    <div class="parameters">
        <input type="text" name="list" placeholder="hash,hash,hash..." value="5HM9b5vnEHbU,U37IX05BI_5j,EM41XyYgaI65" />
        <textarea name="__body__" placeholder="json blob...">
        
[
    {"result": "success", "flags": {"loop": true}, "hash": hash1},
    {"result": "success", "flags": {"nsfw": true}, "hash": hash2},
    {"result": "unauthorized", "flags": {"autoplay": false, "mute": true}, "hash": hash3}
]
        </textarea>
        <input type="button" class="submit" value="Submit"></button>
    </div>
</div>
<div class="clearfix"></div>

<script type="text/javascript" src="/static/live_api.js"></script>

### /api/v2/album

#### POST

Creates a new album.

<div class="tester" data-method="POST" data-endpoint="/api/v2/{ list }">
<pre class="response">$ curl -F "items=hash,hash,hash" https://mediacru.sh/api/v2/album
{"hash": "..."}</pre>
    <div class="parameters">
        <input type="text" name="list" placeholder="hash,hash,hash..." value="5HM9b5vnEHbU,U37IX05BI_5j,EM41XyYgaI65" />
        <input type="button" class="submit" value="Submit"></button>
    </div>
</div>
<div class="clearfix"></div>

## Objects

### File Objects

    Example goes here

Details details details

**Editable properties** (via `POST /api/v2/hash,hash,hash`):

* foo
* bar
* baz

### Album Objects

Albums are a special kind of file object. If `file.type == "album"`, then it's an album and follows this schema:

    Foo bar

## Common Tasks

<div id="uploading"></div>
### Uploading

To upload a file, use one of the upload endpoints. TODO: Finish this.
>>>>>>> Start on new API docs
