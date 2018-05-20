let Stubs = require("./contractStubs.js");
let LocalContractStorage = Stubs.LocalContractStorage;
let Blockchain = Stubs.Blockchain;
let BigNumber = require("bignumber.js");

class Mail {
    constructor(str) {
        var obj = str ? JSON.parse(str) : {};
        this.id = obj.id || 0;
        this.title = obj.title || "";
        this.message = obj.message || "";
        this.from = obj.from || "";
        this.to = obj.to || "";
        this.created = obj.created || "";
        this.readDate = obj.readDate || "";
        this.replyId = obj.replyId;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class NasMailContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "mailCounter");

        LocalContractStorage.defineMapProperty(this, "inputIds");
        LocalContractStorage.defineMapProperty(this, "outputIds");
        LocalContractStorage.defineMapProperty(this, "unreadIds");
        LocalContractStorage.defineMapProperty(this, "removedIds");

        LocalContractStorage.defineMapProperty(this, "mails", {
            parse: (str) => new Mail(str),
            stringify: (o) => o.toString()
        });
    }

    init() {
        this.mailCounter = 0;
    }

    getContractWallet() {
        return "wallet";
    }

    _isAdminTransaction() {
        let from = Blockchain.transaction.from;
        return from === this.getContractWallet();
    }

    markRead(id) {
        let from = Blockchain.transaction.from;
        let mail = this.getById(id);

        if (!mail) {
            return null;
        }

        let unreadIds = this.unreadIds.get(from) || [];
        let unreadIdsNew = [];

        for (let unreadId of unreadIds) {
            if (unreadId != mail.id) {
                unreadIdsNew.push(unreadId);
            }
        }

        this.unreadIds.set(from, unreadIdsNew);
        return mail;
    }

    getById(id) {
        let from = Blockchain.transaction.from;
        let mail = this.mails.get(id);

        if (!mail) {
            return null;
        }
        if (mail.from != from && mail.to != from && mail.to != "users-all") {
            throw new Error("You can't receive someone else's letters");
        }

        if (mail.to == from && !mail.readDate) {
            mail.readDate = new Date();
            this.mails.set(id, mail);
        }

        return mail;
    }

    getInput() {
        let from = Blockchain.transaction.from;
        let inputIds = this.inputIds.get(from) || [];
        let removedIds = this.removedIds.get(from) || [];
        let mails = [];

        let forAll = this.inputIds.get("users-all") || [];
        inputIds = inputIds.concat(forAll);

        for (let id of inputIds) {
            let mail = this.getById(id);
            let isRemoved = false;

            if (!mail) {
                continue;
            }

            for (let removedId of removedIds) {
                if (id == removedId) {
                    isRemoved = true;
                    break;
                }
            }

            if (!isRemoved) {
                if (mail.to == "users-all") {
                    mail.from = "Nebulas Mail";
                    mail.to = from;
                }
                mails.push(mail);
            }
        }

        mails = mails.sort(function (a, b) {
            var parseDate = function parseDate(dateAsString) {
                var dateParts = dateAsString.split("/");
                return new Date(parseInt(dateParts[2], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10));
            };

            return parseDate(b.created) - parseDate(a.created);
        });
        return mails;
    }

    getOutput() {
        let from = Blockchain.transaction.from;
        let outputIds = this.outputIds.get(from) || [];
        let removedIds = this.removedIds.get(from) || [];
        let mails = [];

        for (let id of outputIds) {
            let mail = this.mails.get(id);
            let isRemoved = false;

            if (!mail) {
                continue;
            }

            for (let removedId of removedIds) {
                if (id == removedId) {
                    isRemoved = true;
                    break;
                }
            }

            if (!isRemoved) {
                mails.push(mail);
            }
        }

        return mails;
    }

    getUnread() {
        let from = Blockchain.transaction.from;
        let unreadIds = this.unreadIds.get(from) || [];
        let removedIds = this.removedIds.get(from) || [];
        let mails = [];

        for (let id of unreadIds) {
            let mail = this.getById(id);
            let isRemoved = false;

            if (!mail) {
                continue;
            }

            for (let removedId of removedIds) {
                if (id == removedId) {
                    isRemoved = true;
                    break;
                }
            }

            if (!isRemoved) {
                mails.push(mail);
            }
        }

        return mails;
    }

    getRemoved() {
        let from = Blockchain.transaction.from;
        let ids = this.removedIds.get(from) || [];
        let mails = [];

        for (let id of ids) {
            let mail = this.mails.get(id);
            if (mail) {
                if (mail.to == "users-all") {
                    mail.from = "Nebulas Mail";
                    mail.to = from;
                }
                mails.push(mail);
            }
        }

        return mails;
    }

    send(title, message, address, replyId) {
        let from = Blockchain.transaction.from;
        let isAdmin = from == "";
        let counter = this.mailCounter;

        if (!title) {
            throw new Error("The title field is required");
        }
        if (!message) {
            throw new Error("The message field is required");
        }
        if (!address) {
            throw new Error("The address field is required");
        }
        if (!this._isAdminTransaction() && address == "users-all") {
            throw new Error("Access denied: you are not admin");
        }

        let mail = new Mail();
        mail.id = counter;
        mail.title = title;
        mail.message = message;
        mail.from = from;
        mail.to = address;
        mail.created = new Date();

        if (+replyId == 0 || +replyId) {
            let replyMessage = this.mails.get(replyId);
            mail.replyId = replyId;

            if (replyMessage.to == "users-all") {
                throw new Error("You can't reply to this email");
            }
            if (!replyMessage || replyMessage.to != from) {
                throw new Error("The reply ID must refer to your received message");
            }
        }

        let outputIds = this.outputIds.get(from) || [];
        outputIds.push(mail.id);
        this.outputIds.set(from, outputIds);

        let inputIds = this.inputIds.get(address) || [];
        inputIds.push(mail.id);
        this.inputIds.set(address, inputIds);

        let unreadIds = this.unreadIds.get(address) || [];
        unreadIds.push(mail.id);
        this.unreadIds.set(address, unreadIds);

        this.mails.put(mail.id, mail);
        this.mailCounter = new BigNumber(counter).plus(1).toNumber();
    }

    remove(id) {
        let from = Blockchain.transaction.from;
        let mail = this.mails.get(id);

        if (mail && mail.from != from && mail.to != from) {
            throw new Error("You can't delete someone else's letters");
        }

        if (mail) {
            let removedIds = this.removedIds.get(from) || [];
            let isRemoved = false;

            for (let removedId of removedIds) {
                if (mail.id == removedId) {
                    isRemoved = true;
                }
            }

            if (!isRemoved) {
                removedIds.push(mail.id);
            }
            this.removedIds.set(from, removedIds);
        }
    }
}

module.exports = NasMailContract;