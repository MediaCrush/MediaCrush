# MediaCrush API

The MediaCrush API returns JSON on all methods. You might be interested in some of the API wrappers listed on our
[documentation overview](/docs/).

MediaCrush also supports CORS for cross-origin requests. If you intend to use the MediaCrush API from browser JavaScript,
you will want to set the `X-CORS-Status` header to `1`. This is because browsers will errornously handle any request that
returns a non-2xx status code (which the MediaCrush API frequently does). If you set this header, each JSON response will
include the `x-status` property with the real status code.

Example:

    GET /api/tVWMM_ziA3nm
    X-CORS-Status: 1

    {
        ...
        "x-status": 404
    }

# Methods

## Albums

### /api/album/create

*Parameters*: `list`, a list of MediaCrush hashes.

*Returns*: The hash of the album on success, an error code otherwise.

    POST /api/album/create
    list=LxqXxVPAvqqB,tVWMM_ziA3nm

    {
        "hash": "LxqXxVPAvqqC"
    }

In case of error, the response will contain an 'error' parameter and additional information if necessary.

*Return codes*:

<table>
    <tr>
        <th>HTTP code</th>
        <th>Meaning</th>
        <th>Success</th>
    </tr>
    <tr>
        <td>200</td>
        <td>The album was created correctly.</td>
        <td>true</td>
    </tr>
    <tr>
        <td>404</td>
        <td>At least one of the items in the list could not be found.</td>
        <td>false</td>
    </tr>
    <tr>
        <td>413</td>
        <td>Albums with more than 50 items are unsupported.</td>
        <td>false</td>
    </tr>
    <tr>
        <td>415</td>
        <td>At least one of the items in the list is not a File (i.e, you tried to create an album that cantains an album)</td>
        <td>false</td>
    </tr>
</table>

## Hash information endpoints

### /api/&lt;hash&gt;

*Note*: this method is equivalent to `/<hash>.json`.

*Parameters*: none.

*Returns*: information about `<hash>`. Please see Appendix A for reference objects for each possible type.

    GET /api/CPvuR5lRhmS0

    {
      "blob_type": "video",
      "compression": 8.93,
      "files": [
        {
          "file": "/CPvuR5lRhmS0.mp4",
          "type": "video/mp4"
        },
        {
          "file": "/CPvuR5lRhmS0.ogv",
          "type": "video/ogg"
        },
        {
          "file": "/CPvuR5lRhmS0.gif",
          "type": "image/gif"
        }
      ],
      "extras": [
      ],
      "original": "/CPvuR5lRhmS0.gif",
      "hash": "CPvuR5lRhmS0",
      "type": "image/gif",
    }

When a file is uploaded to MediaCrush, it enters our processing pipeline. Various (lossless) tweaks and
optimizations are done, and it's converted into several browser-friendly formats. All the files associated
with a blob are included in the "files" array. If you wish to display a file to the user, examine the
"blob_type" property, which may be "video", "audio", or "image". Iterate over the files available and
choose any mimetypes that match what your platform can support.

Please note that you should not trust the value of "type". This is the original mimetype that was supplied
by the user at the time of upload. MediaCrush disregards this value and examines uploaded files to determine
their type empirically and updates "blob_type" accordingly before moving files into the processing pipline.

If the file is not found, you will get a dictionary like:

    GET /api/CPvuR5lRhmS0

    {
      "error": 404
    }

### /api/info?list=&lt;hash&gt;,...

*Parameters*: `list`, a comma-separated list of hashes.

*Returns*: an array of objects. Please see Appendix A for reference objects for each possible type.

    GET /api/info?list=tVWMM_ziA3nm,CPvuR5lRhmS0

    {
      "CPvuR5lRhmS0": {
        "blob_type": "video",
        "compression": 8.93,
        "files": [
          {
            "file": "/CPvuR5lRhmS0.mp4",
            "type": "video/mp4"
          },
          {
            "file": "/CPvuR5lRhmS0.ogv",
            "type": "video/ogg"
          },
          {
            "file": "/CPvuR5lRhmS0.gif",
            "type": "image/gif"
          }
        ],
        "extras": [
        ],
        "original": "/CPvuR5lRhmS0.gif",
        "hash": "CPvuR5lRhmS0",
        "type": "image/gif",
      },
      "tVWMM_ziA3nm": {
        "blob_type": "video",
        "compression": 17.99,
        "files": [
          {
            "file": "/tVWMM_ziA3nm.mp4",
            "type": "video/mp4"
          },
          {
            "file": "/tVWMM_ziA3nm.ogv",
            "type": "video/ogg"
          },
          {
            "file": "/tVWMM_ziA3nm.gif",
            "type": "image/gif"
          }
        ],
        "extras": [
        ],
        "original": "/tVWMM_ziA3nm.gif",
        "hash": "tVWMM_ziA3nm",
        "type": "image/gif"
      }
    }

### /api/url/info

*Parameters*: `list`, a comma-separated URLs to check, or a single URL.

*Returns*: A dictionary mapping URLs that have been previously uploaded to MediaCrush files. 

    POST /api/url/info
    list=http://i.imgur.com/rctIj1M.jpg,http://does.not/exist.gif

    {
      "http://does.not/exist.gif": null, 
      "http://i.imgur.com/rctIj1M.jpg": {
        "blob_type": "image", 
        "compression": 1.0, 
        "extras": [], 
        "files": [
          {
            "file": "/4Gt0YcGMPA7S.jpg", 
            "type": "image/jpeg"
          }
        ], 
        "hash": "4Gt0YcGMPA7S", 
        "original": "/4Gt0YcGMPA7S.jpg", 
        "type": "image/jpeg"
      }
    }


### /api/&lt;hash&gt;/exists

*Parameters*: none.

*Returns*: a dictionary answering the question of whether a hash exists.

    GET /api/XKacFeUrWuqm/exists

    {
      "exists": true
    }


### /api/&lt;hash&gt;/status

*Parameters*: none.

*Returns*: the processing status of the file identified by `<hash>`.

    GET /api/LxqXxVPAvqqB/status

    {
      "status": "done",
      "hash": "LxqXxVPAvqqB",
      "LxqXxVPAvqqB": {
        "blob_type": "video",
        "compression": 8.93,
        "files": [
          {
            "file": "/LxqXxVPAvqqB.mp4",
            "type": "video/mp4"
          },
          {
            "file": "/LxqXxVPAvqqB.ogv",
            "type": "video/ogg"
          },
          {
            "file": "/LxqXxVPAvqqB.gif",
            "type": "image/gif"
          }
        ],
        "extras": [
        ],
        "original": "/LxqXxVPAvqqB.gif",
        "hash": "LxqXxVPAvqqB",
        "type": "image/gif"
      }
    }

*Return codes*:

<table>
    <tr>
        <th>HTTP code</th>
        <th>Meaning</th>
        <th>Success</th>
    </tr>
    <tr>
        <td>200</td>
        <td>
            <p>The file was found.</p>
            <p><em>Note</em>: this doesn't mean that the processing succeeded. Check the table below.</td></p>
        <td>true</td>
    </tr>
    <tr>
        <td>404</td>
        <td>There is no file with that hash.</td>
        <td>false</td>
    </tr>
    <tr>
        <td>415</td>
        <td>The data type associated with this hash does not accept processing.</td>
        <td>false</td>
    </tr>
</table>

*Possible values for `status`*:

<table>
    <tr>
        <th>Value</th>
        <th>Meaning</th>
    </tr>
    <tr>
        <td>done</td>
        <td>The file has been processed.</td>
    </tr>
    <tr>
        <td>ready</td>
        <td>The file is still processing, but it is ready to be consumed by a web browser.</td>
    </tr>
    <tr>
        <td>pending</td>
        <td>The is in the processing queue.</td>
    </tr>
    <tr>
        <td>processing</td>
        <td>The file is currently being processed.</td>
    </tr>
    <tr>
        <td>error</td>
        <td>A critical processing step finished early with an abnormal return code.</td>
    </tr>
    <tr>
        <td>timeout</td>
        <td>The file took too long to process.</td>
    </tr>
    <tr>
        <td>unrecognised</td>
        <td>MediaCrush does not support processing this media format.</td>
    </tr>
    <tr>
        <td>internal_error</td>
        <td>The workers died unexpectedly. The client is advised to try again.</td>
    </tr>
</table>

*Notes:*

The "result" object will only be included if the status is "done".

## Hash manipulation endpoints

### /api/&lt;hash&gt;/delete

*Parameters*: none.

*Returns*: a dictionary describing whether the delete operation succeeded. In most cases it is easier to check the HTTP status code.

    GET /api/CPvuR5lRhmS0/delete

    {
      "status": "success"
    }

If the request is unsuccessful, you will get a response like:

    GET /api/CPvuR5lRhmS0/delete

    {
      "error": 401
    }


*Return codes*:

<table>
    <tr>
        <th>HTTP code</th>
        <th>Meaning</th>
        <th>Success</th>
    </tr>
    <tr>
        <td>200</td>
        <td>The IP matches the stored hash and the file (if applicable) was deleted.</td>
        <td>true</td>
    </tr>
    <tr>
        <td>401</td>
        <td>The IP does not match the stored hash.</td>
        <td>false</td>
    </tr>
    <tr>
        <td>404</td>
        <td>There is no such hash.</td>
        <td>false</td>
    </tr>
</table>

### /api/upload/file

*Parameters*: `file`, the file to upload.

*Returns*: a dictionary with the hash of the file in case the upload succeeded, a dictionary containing the error code if it did not succeed.

    curl -F file=@/tmp/cat.gif /api/upload/file

    {
      "hash": "LxqXxVPAvqqB"
    }

In case of error, the response will contain an 'error' parameter and additional information if necessary.

    curl -F file=@/tmp/cat.gif /api/upload/file

    {
      "error": 409,
      "hash": "LxqXxVPAvqqB",
      "LxqXxVPAvqqB": {
        "blob_type": "video",
        "compression": 0.0,
        "files": [
          {
            "file": "/LxqXxVPAvqqB.png",
            "type": "image/png"
          }
        ],
        "extras": [
        ],
        "original": "/LxqXxVPAvqqB.png",
        "hash": "LxqXxVPAvqqB",
        "type": "image/png"
      }
    }

*Return codes*:

<table>
    <tr>
        <th>HTTP code</th>
        <th>Meaning</th>
        <th>Success</th>
    </tr>
    <tr>
        <td>200</td>
        <td>The file was uploaded correctly.</td>
        <td>true</td>
    </tr>
    <tr>
        <td>409</td>
        <td>The file was already uploaded.</td>
        <td>true</td>
    </tr>
    <tr>
        <td>420</td>
        <td>The rate limit was exceeded. Enhance your calm.</td>
        <td>false</td>
    </tr>
    <tr>
        <td>415</td>
        <td>The file extension is not acceptable.</td>
        <td>false</td>
    </tr>
</table>

### /api/upload/url

*Parameters*: `url`, the URL from where to fetch the file to upload.

*Returns*: the same as /api/upload/file.

*Return codes*:

<table>
    <tr>
        <th>HTTP code</th>
        <th>Meaning</th>
        <th>Success</th>
    </tr>
    <tr>
        <td>200</td>
        <td>The file was uploaded correctly.</td>
        <td>true</td>
    </tr>
    <tr>
        <td>400</td>
        <td>The URL is invalid.</td>
        <td>false</td>
    </tr>
    <tr>
        <td>404</td>
        <td>The requested file does not exist.</td>
        <td>false</td>
    </tr>
    <tr>
        <td>409</td>
        <td>The file was already uploaded.</td>
        <td>true</td>
    </tr>
    <tr>
        <td>415</td>
        <td>The file extension is not acceptable.</td>
        <td>false</td>
    </tr>
    <tr>
        <td>420</td>
        <td>The rate limit was exceeded. Enhance your calm.</td>
        <td>false</td>
    </tr>
</table>

# Appendix A

## Example objects

### File

    {
      "blob_type": "video",
      "compression": 8.93,
      "files": [
        {
          "file": "/CPvuR5lRhmS0.mp4",
          "type": "video/mp4"
        },
        {
          "file": "/CPvuR5lRhmS0.ogv",
          "type": "video/ogg"
        },
        {
          "file": "/CPvuR5lRhmS0.gif",
          "type": "image/gif"
        }
      ],
      "extras": [
      ],
      "original": "/CPvuR5lRhmS0.gif",
      "hash": "CPvuR5lRhmS0",
      "type": "image/gif"
    }

When a file is uploaded to MediaCrush, several associated files may be generated. In the case of GIF
files, two video files are generated - one with h.264/mpeg and another with theora/vorbis. Some media
will also have "extra" files. In the case of uploaded videos, we'll include an `image/png` thumbnail
file in the extras.

### Album

    {
      "files": [
        {
          "blob_type": "video",
          "compression": 0.0,
          "extras": [],
          "files": [
            {
              "file": "/yOEHB2vDiWS-.jpe",
              "type": "image/jpeg"
            }
          ],
          "original": "/yOEHB2vDiWS-.jpe",
          "type": "image/jpeg"
        },
        {
          "blob_type": "video",
          "compression": 0.0,
          "extras": [],
          "files": [
            {
              "file": "/vLGcgr9eXhsH.jpe",
              "type": "image/jpeg"
            }
          ],
          "original": "/vLGcgr9eXhsH.jpe",
          "type": "image/jpeg"
        },
        {
          "blob_type": "video",
          "compression": 0.0,
          "extras": [],
          "files": [
            {
              "file": "/uEKCcQyLVci7.jpe",
              "type": "image/jpeg"
            }
          ],
          "original": "/uEKCcQyLVci7.jpe",
          "type": "image/jpeg"
        }
      ],
      "hash": "6ecd2bbd34ec",
      "type": "application/album"
    }
