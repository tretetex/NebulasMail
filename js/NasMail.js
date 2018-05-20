let renderer = new MailRenderer();

class NasMail {
    static loadInput() {
        let elements = document.querySelectorAll(`nav a`);
        for (let element of elements) {
            element.classList.remove("active");
        }
        document.querySelector(`#loadInput`).classList.add("active");

        renderer.showStart();
        renderer.showLoader();

        api.getInputSimulate(function (apiResponse) {
            let count = renderer.run(apiResponse, "input");
            document.querySelector("#loadInput .counter").innerHTML = count;
            if (window.localStorage) {
                window.localStorage.setItem("inputCount", count);
            }
        });
    }

    static loadOutput() {
        let elements = document.querySelectorAll(`nav a`);
        for (let element of elements) {
            element.classList.remove("active");
        }
        document.querySelector(`#loadOutput`).classList.add("active");

        renderer.showStart();
        renderer.showLoader();

        api.getOutput(function (apiResponse) {
            let count = renderer.run(apiResponse, "output");
            document.querySelector("#loadOutput .counter").innerHTML = count;
            if (window.localStorage) {
                window.localStorage.setItem("outputCount", count);
            }
        });
    }

    static loadRemoved() {
        let elements = document.querySelectorAll(`nav a`);
        for (let element of elements) {
            element.classList.remove("active");
        }
        document.querySelector(`#loadRemoved`).classList.add("active");

        renderer.showStart();
        renderer.showLoader();

        api.getRemoved(function (apiResponse) {
            let count = renderer.run(apiResponse);
            document.querySelector("#loadRemoved .counter").innerHTML = count;
            if (window.localStorage) {
                window.localStorage.setItem("removedCount", count);
            }
        });
    }

    static showComposeForm() {
        let elements = document.querySelectorAll(`.messages a`);
        for (let element of elements) {
            element.classList.remove("active");
        }
        renderer.compose.showForm();
    }
}