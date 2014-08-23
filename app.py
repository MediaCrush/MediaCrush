from mediacrush.app import app
from mediacrush.config import _cfg, _cfgi

if __name__ == '__main__':
    app.run(host=_cfg("debug-host"), port=_cfgi('debug-port'), debug=True)
