const CONTRACT_ADDRESS = "n22SeUb2hezta8Vboooym4VBHHLUSMiVJPe";

class NasMailContractApi extends SmartContractApi {
    constructor(contractAddress) {
        super(contractAddress || CONTRACT_ADDRESS);
    }

    markRead(id, cb) {
        this._call({
            callArgs: `[${id}]`,
            callFunction: "markRead",
            callback: cb
        });
    }

    getById(id, cb) {
        this._simulateCall({
            callArgs: `[${id}]`,
            callFunction: "getById",
            callback: cb
        });
    }

    getInput(cb) {
        this._call({
            callFunction: "getInput",
            callback: cb
        });
    }

    // Returns mails without date read updating
    getInputSimulate(cb) {
        this._simulateCall({
            callFunction: "getInput",
            callback: cb
        });
    }

    getOutput(cb) {
        this._simulateCall({
            callFunction: "getOutput",
            callback: cb
        });
    }

    getUnread(cb) {
        this._call({
            callFunction: "getUnread",
            callback: cb
        });
    }

    // Returns mails without date read updating
    getUnreadSimulate(cb) {
        this._simulateCall({
            callFunction: "getUnread",
            callback: cb
        });
    }

    getRemoved(cb) {
        this._simulateCall({
            callFunction: "getRemoved",
            callback: cb
        });
    }

    send(title, message, to, replyId, cb) {
        replyId = replyId == 0 || replyId ? `, ${replyId}` : "";

        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.split(search).join(replacement);
        };

        message = message.replaceAll("\n", "#n");

        this._call({
            callArgs: `["${title}", "${message}", "${to}"${replyId}]`,
            callFunction: "send",
            callback: cb
        });
    }

    remove(id, cb) {
        this._call({
            callArgs: `[${id}]`,
            callFunction: "remove",
            callback: cb
        });
    }
}