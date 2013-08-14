# MediaCrush API

The MediaCrush API returns JSON on all methods. They also support JSONP callbacks. To specify the JavaScript function to be called use the `callback` GET parameter. 

Example:    

    GET /api/tVWMM_ziA3nm?callback=demo

    demo({
        ...
    });
    
# Methods

## /api/&lt;hash&gt;

*Note*: this method is equivalent to `/<hash>.json`.

*Parameters*: none.

*Returns*: information about the file whose hash is `<hash>`. 

    GET /api/CPvuR5lRhmS0

    {
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
      "original": "/CPvuR5lRhmS0.gif", 
      "type": "image/gif"
    }

If the file is not found, you will get a dictionary like:

    GET /api/CPvuR5lRhmS0

    {
      "error": 404
    }

## /api/info?list=&lt;hash&gt;,...

*Parameters*: `list`, a comma-separated list of hashes.

*Returns*: an array of file objects.

    GET /api/info?list=tVWMM_ziA3nm,CPvuR5lRhmS0

    {
      "CPvuR5lRhmS0": {
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
        "original": "/CPvuR5lRhmS0.gif", 
        "type": "image/gif"
      }, 
      "tVWMM_ziA3nm": {
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
        "original": "/tVWMM_ziA3nm.gif", 
        "type": "image/gif"
      }
    }

## /api/&lt;hash&gt;/delete

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
        <td>The IP matches the stored hash and the file was deleted.</td>
        <td>true</td>
    </tr>
    <tr>
        <td>401</td>
        <td>The IP does not match the stored hash.</td>
        <td>false</td>
    </tr>
    <tr>
        <td>404</td>
        <td>There is no file with that hash.</td>
        <td>false</td>
    </tr>
</table>

## /api/upload/file

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
      "hash": "LxqXxVPAvqqB"
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

## /api/upload/url

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
