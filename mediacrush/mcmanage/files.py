from ..objects import File
from ..files import delete_file

def delete_file(arguments):
    f = File.from_hash(arguments['<hash>'])
    
    if not f.original:
        print "%r is not a valid file." % arguments['<hash>']
        return

    delete_file(f)
    print "Done, thank you."
