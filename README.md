# NebulasMail

![screen](https://github.com/tretetex/NebulasMail/blob/master/img/demo.png?raw=true)

This application allows you to exchange letters with other Nebulas wallet owners.
Powered by Nebulas.

## Smart contract provides methods:

- markRead(id) - marks a message as read
- getById(id) - returns message by ID
- getInput() - returns incoming messages
- getOutput() - returns the sent messages
- getUnread() - returns unread messages
- getRemoved() - returns deleted messages
- send(title, message, address, replyId) - send message
- remove(id) - delete message
