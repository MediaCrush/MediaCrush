from mediacrush.app import app
from mediacrush.config import _cfg, _cfgi
from mediacrush.files import extension

import os
import scss
from shutil import rmtree, copyfile

app.static_folder = os.path.join(os.getcwd(), "static")
scss.config.LOAD_PATHS = [
    './styles/'
]

def prepare():
    if os.path.exists(app.static_folder):
        rmtree(app.static_folder)
    os.makedirs(app.static_folder)
    compiler = scss.Scss(scss_opts = {
        'style': 'compressed'
    })

    # Compile styles (scss)
    d = os.walk('styles')
    for f in list(d)[0][2]:
        if extension(f) == "scss":
            with open(os.path.join('styles', f)) as r:
                output = compiler.compile(r.read())

            parts = f.rsplit('.')
            css = '.'.join(parts[:-1]) + ".css"

            with open(os.path.join(app.static_folder, css), "w") as w:
                w.write(output)
                w.flush()

    copy = ['images', 'scripts']
    preprocess = ['scripts/view.js', 'scripts/mediacrush.js']

    # Simple copy images, preprocess some JS files 
    for folder in copy:
        for f in list(os.walk(folder))[0][2]:
            outputpath = os.path.join(app.static_folder, os.path.basename(f))
            inputpath = os.path.join(folder, f)

            if inputpath in preprocess:
                with open(inputpath) as r:
                    # Using Jinja here is overkill
                    output = r.read()
                    output = output.replace("{{ protocol }}", _cfg("protocol"))
                    output = output.replace("{{ domain }}", _cfg("domain"))

                with open(outputpath, "w") as w:
                    w.write(output)
                    w.flush()
            else:
                copyfile(inputpath, outputpath)

@app.before_first_request
def compile_first():
    prepare()

@app.before_request
def compile_if_debug():
    if app.debug:
        prepare()

if __name__ == '__main__':
    app.run(host=_cfg("debug-host"), port=_cfgi('debug-port'), debug=True)
