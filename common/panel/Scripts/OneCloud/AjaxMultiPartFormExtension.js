window.addEventListener("submit", function (e) {
    var form = e.target;
    if (form.getAttribute("enctype") === "multipart/form-data") {
        if (form.dataset.ajax) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var xhr = new XMLHttpRequest();
            xhr.open(form.method, form.action);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    try {
                        if (xhr.response != null) {
                            var jsonResponse = JSON.parse(xhr.responseText);
                            if (jsonResponse != null) {
                                window.location.href = jsonResponse.redirectTo;
                            }
                        }
                    } catch (e) {
                        if (form.dataset.ajaxUpdate) {
                            var updateTarget = document.querySelector(form.dataset.ajaxUpdate);
                            if (updateTarget) {
                                updateTarget.innerHTML = xhr.responseText;
                            }
                        }
                    }
                }
            };
            xhr.send(new FormData(form));
        }
    }
}, true);