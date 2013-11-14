from ..objects import File
from ..files import delete_file

def files_delete(arguments):
    hash = arguments['<hash>']
    if File.exists(hash):
        print("%r is not a valid file." % arguments["<hash>"])
        return

    f = File.from_hash(hash)
    delete_file(f)
    print("Done, thank you.")
