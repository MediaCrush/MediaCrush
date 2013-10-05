from .config import _cfg

from mandrill import Mandrill

email = Mandrill(_cfg("mandrill_api"))

def _email_admins(subject, content):
    admin_email = _cfg("admin_email")

    if "," in admin_email:
        to = []
        for i in admin_email.split(","):
            to.append({'email': i})
    else:
        to = [{'email': admin_email}]

    message = {
        'subject': subject,
        'text': content,
        'from_email': _cfg("from_email"),
        'to': to,
    }

    return email.messages.send(message=message, async=True)

def send_report(text):
    return _email_admins("MediaCrush report", text)

if __name__ == '__main__':
    print(report('bruasdf'))
