# Contributing

Thanks for offering your help! Here's how you contribute:

1. Fork the repository
2. Do your work in that fork
3. Submit a pull request

After you submit a pull request, we will review it and suggest changes and improvements. Then, we'll merge it into
our repository and the changes will immediately go live.


## DOs and DON'Ts

Follow these guidelines to contribute to MediaCrush.

### DO

* Add documentation for things that seem odd to you
* Install a copy of MediaCrush locally
* Test changes (especially ones to the backend) on your local copy

### DON'T

* Add dependencies without checking with the maintainers (through GitHub issues or IRC)

## Coding Standards

We have a few standards, though. Make sure you write your code like this.

* Four spaces, not tabs
* Spaces between mathematical operators: `2 + 4 / (10 - 4)`

### Python

    @app.before_request
    def find_dnt():
        field = "Dnt"
        do_not_track = False
        if field in request.headers:
            do_not_track = True if request.headers[field] == "1" else False

        g.do_not_track = do_not_track

### JavaScript

    function fooBar() {
        var example = 1234;
        registerThing(function(e) {
            // Do stuff
        }, false);
        bar(1, 2, 3);
    }

### CSS

    .foo .bar {
        example: 1 2 3;
        -moz-foobar: 1234;
        -webkit-foobar: 1234;
        foobar: 1234;
    }
