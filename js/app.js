let timeout = setTimeout(function it() {
    if (isExtensionExist !== undefined) {
        document.querySelector("#compose").addEventListener("click", () => NasMail.showComposeForm());
        document.querySelector("#loadInput").addEventListener("click", () => NasMail.loadInput());
        document.querySelector("#loadOutput").addEventListener("click", () => NasMail.loadOutput());
        document.querySelector("#loadRemoved").addEventListener("click", () => NasMail.loadRemoved());
    } else {
        timeout = setTimeout(it, 200);
    }
}, 200);

/* ------------------------------ */

function showLoaders() {
    let loader = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
    var elements = document.querySelectorAll(".loader");
    for (var item of elements) {
        item.innerHTML = loader;
    }
}

function hideLoaders() {
    var elements = document.querySelectorAll(".loader");
    for (var item of elements) {
        item.innerHTML = "";
    }
}