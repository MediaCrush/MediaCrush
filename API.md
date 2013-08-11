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

[Source](http://www.hurl.it/hurls/ee2ef1f3c1612a21323b391f729942cf3ebbd7a1/7a4e1c9bb7235ebe01b033344b0ad07238ee8691)

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

[Source](http://www.hurl.it/hurls/45f2cc3d72b2ece8ca6f0e8afaa09c49a8f261f4/e1d4361c370d2f92098ca4d7e29146b4695e7a3b)

