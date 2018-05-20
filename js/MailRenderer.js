class MailRenderer {
    constructor() {
        this.mailComposer = new MailComposer();
    }

    get compose() {
        return this.mailComposer;
    }

    showLoader() {
        document.querySelector(".messages").innerHTML = "<br><br><div style='color: #8a9098; font-size: 14px;' class='d-flex justify-content-center'><div class='lds-ellipsis'><div></div><div></div><div></div><div></div></div></div>";
    }

    showStart() {
        document.querySelector(".content").innerHTML = `<div class="about d-flex flex-column align-items-center">
                <div class="mails-img"></div>
                Now your messages are available directly in your NEBULAS wallet!
            </div>`;

    }

    run(apiResponse, mailType) {
        return this._renderMails(apiResponse, mailType);
    }

    _renderMails(apiResponse, mailType) {
        if (!apiResponse.result) {
            return "";
        }


        let count = "";
        let result = JSON.parse(apiResponse.result);
        document.querySelector(".messages").innerHTML = "";

        if (result && result.length > 0) {
            result = result.reverse();

            for (const mail of result) {
                this._renderMail(mail, mailType);
                count++;
            }
        } else {
            document.querySelector(".messages").innerHTML = "<br><br><div style='color: #8a9098; font-size: 14px;' class='d-flex justify-content-center'>Empty</div>";
        }

        return count;
    }

    _renderMail(mail, mailType) {
        let authors = `<div>
                            <span class="from">
                                <b>from:</b>
                            </span>
                            ${mail.from}
                        </div>
                        <div>
                            <span class="from">
                                <b>to:</b>
                            </span>
                            ${mail.to}
                        </div>`;

        if (mailType == "input") {
            authors = `<div>
                            <span class="from">
                                <b>from:</b>
                            </span>
                            ${mail.from}
                        </div>`;
        } else if (mailType == "output") {
            authors = `<div>
                            <span class="from">
                                <b>to:</b>
                            </span>
                            ${mail.to}
                        </div>`;
        }

        let innerHtml = `<a href="#" class="message" data-id="${mail.id}">
                            <div class="title d-flex justify-content-between align-items-center">${mail.title}</div>
                            <span class="from">
                                ${convertUnixStampToScreenDate(Date.parse(mail.created))}
                            </span>
                            ${authors}
                        </a>`;

        let container = document.querySelector(".messages");
        let div = document.createElement('div');
        div.innerHTML = innerHtml;
        div.firstChild.onclick = () => this._openMailHandler(mail, mailType);
        container.append(div.firstChild);
    }

    _openMailHandler(mail, mailType) {
        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.split(search).join(replacement);
        };

        mail.message = mail.message.replaceAll("#n", "<br>");

        let replyForm = "";
        let authors = `<div class="from d-flex align-items-center">
                            <span class="far fa-user-circle"></span>from: ${mail.from}
                        </div>
                        <div class="from d-flex align-items-center">
                            <span class="far fa-user-circle"></span>to: ${mail.to}
                        </div>`;
        let deleteBtn = "";

        if (mailType == "input") {
            deleteBtn = `<a href="#" class="far fa-trash-alt delete"></a>`;
            authors = `<div class="from d-flex align-items-center">
                        <span class="far fa-user-circle"></span>from: ${mail.from}
                    </div>`;
            replyForm = `<form>
                            <div class="form-group">
                                <textarea class="form-control form-control-sm" id="replyMessage" rows="4" required></textarea>
                            </div>
                            <div class="reply-btn d-flex align-items-center">
                                <button type="submit" class="btn btn-sm btn-outline-primary" id="replyBtn">Send answer</button>
                            </div>
                        </form>`;
        } else if (mailType == "output") {
            deleteBtn = `<a href="#" class="far fa-trash-alt delete"></a>`;
            authors = `<div class="from d-flex align-items-center">
                            <span class="far fa-user-circle"></span>to: ${mail.to}
                        </div>`;
        }

        let elements = document.querySelectorAll(`.messages a`);
        for (let element of elements) {
            element.classList.remove("active");
        }

        document.querySelector(`.messages a[data-id='${mail.id}']`).classList.add("active");

        document.querySelector(".content").innerHTML = `<div class="message">
                <div class="wrapper">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="title">${mail.title}</div>
                        ${deleteBtn}
                    </div>
                    <div class="meta">
                        <div class="from d-flex align-items-center">
                            <span class="far fa-clock"></span> ${convertUnixStampToScreenDate(Date.parse(mail.created))}
                        </div>
                        ${authors}
                    </div>
                    <hr>
                    <div class="text">${mail.message}</div>
                    ${replyForm}
                </div>
            </div>`;

        if (mailType == "input" || mailType == "output") {
            document.querySelector(".content .message .delete").onclick = () => this._deleteHandler(mail);
        }
        if (mailType == "input") {
            document.querySelector("#replyBtn").onclick = () => this._replyHandler(mail);
        }
    }

    _replyHandler(mail) {
        let to = mail.from;
        let title = mail.title;
        let message = document.querySelector("#replyMessage").value;
        let replyId = mail.id;

        api.send(title, message, to, replyId);
    }

    _deleteHandler(mail) {
        let container = document.querySelector(`.messages a[data-id='${mail.id}'] .title`);
        let div = document.createElement('div');
        div.innerHTML = `<div class='d-flex justify-content-center align-items-center'>
                <div style='color: #8a9098; font-size: 13px;'>deleting</div>
                <div class='lds-ellipsis'>
                    <div></div><div></div><div></div><div></div>
                </div>
            </div>`;
        container.append(div.firstChild);

        api.remove(mail.id, (resp) => {
            if (resp && resp.result) {
                document.querySelector(".content").innerHTML = `<div class="message">Message has been moved to trash</div>`;

                document.querySelector(`.messages a[data-id='${mail.id}']`).remove;
            }
        });
    }
}

class MailComposer {
    showLoader() {
        document.querySelector(".content").innerHTML = "<br><br><div style='color: #8a9098; font-size: 14px;' class='d-flex justify-content-center'>Loading...</div>";
    }

    showForm() {
        let innerHtml = `<div class="compose">
                <form>
                    <div class="form-group">
                        <label for="mailAddress">To</label>
                        <input type="text" class="form-control form-control-sm" id="mailAddress" placeholder="Nebulas Address">
                    </div>
                    <div class="form-group">
                        <label for="mailTitle">Title</label>
                        <input type="text" class="form-control form-control-sm" id="mailTitle" placeholder="Your title">
                    </div>
                    <div class="form-group">
                        <label for="mailMessage">Message</label>
                        <textarea class="form-control form-control-sm" id="mailMessage" rows="4"></textarea>
                    </div>
                    <div class="reply-btn d-flex align-items-center">
                        <button type="submit" class="btn btn-sm btn-success">Send</button>
                    </div>
                </form>
            </div>`;

        let container = document.querySelector(".content");
        let div = document.createElement('div');
        div.innerHTML = innerHtml;
        div.firstChild.querySelector("button").onclick = () => this._sendMailHandler();

        container.innerHTML = "";
        container.append(div.firstChild);
    }

    _sendMailHandler() {
        let address = document.querySelector("#mailAddress").value;
        let title = document.querySelector("#mailTitle").value;
        let message = document.querySelector("#mailMessage").value;

        api.send(title, message, address);
    }
}