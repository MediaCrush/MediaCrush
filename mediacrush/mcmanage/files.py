from ..objects import File
from ..files import delete_file

def files_delete(arguments):
    hash = arguments['<hash>']

    f = File.from_hash(hash)
    if not f:
        print("%r is not a valid file." % arguments["<hash>"])
        return
    delete_file(f)
    print("Done, thank you.")
