"""GifQuick manage.

Usage:
    gqmanage.py database clear
    gqmanage.py database upgrade
    gqmanage.py admin list
    gqmanage.py admin add <pwhash>
    gqmanage.py admin delete <pwhash>

"""

from docopt import docopt

from gifquick.gqmanage.database import database_clear, database_upgrade

database_commands = {
    'clear': database_clear,
    'upgrade': database_upgrade,
}

mapping = {
    'database': database_commands,
    'admin': None,
}

def find_true(arguments, mapping_dict):
    return filter(lambda x: x is not None, [item if arguments[item] else None for item in mapping_dict])[0]

if __name__ == '__main__':
    arguments = docopt(__doc__, version='1.0')
    module = find_true(arguments, mapping)
    commands = mapping[module] 
    command = find_true(arguments, commands)
    command = commands[command]

    command(arguments)

