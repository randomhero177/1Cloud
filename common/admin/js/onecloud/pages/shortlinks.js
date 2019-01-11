const shortlinksConfig = {
    addLinkForm: document.querySelector('#add-shortlinks-form'),
    addUrlInput: document.querySelector('#add-shortlinks-form [name="RedirectToUrl"]'),
    addPartnerSelect: document.querySelector('#add-shortlinks-form [name="Filter.PartnerId"]'),
    detailsLinkBtnSelector: '[id*="shortlinks-details"]',
    detailsLinkModalSelector: '#details-shortlinks-modal',
    deleteLinkBtnSelector: '[id*="shortlinks-remove"]',
    deleteLinkModalSelector: '#remove-shortlinks-modal',
    deleteLinkForm: document.querySelector('#remove-shortlinks-form'),
    deleteLinkIdElem: document.querySelector('#shortLinkId'),
    deleteLinkConfirmElem: document.querySelector('#remove-shortlinks-confirm')
};
$(function () {
    let c = shortlinksConfig;
    let delBtn = c.deleteLinkForm.querySelector('.btn-primary');

    $(c.addLinkForm).submit(function (e) {
        e.preventDefault();
        sendPostRequest('#' + c.addLinkForm.id, c.addLinkForm.action, { 
            PartnerId : c.addPartnerSelect.value, 
            RedirectToUrl: c.addUrlInput.value
        });
    });

    $(c.detailsLinkBtnSelector).click(function (e) {
        e.preventDefault();
        let url = e.target.dataset.href;
        window.util.fillPreview(c.detailsLinkModalSelector.replace('#', ''), url, function () {
            $(c.detailsLinkModalSelector).modal('show');
        });
    });

    $(c.deleteLinkBtnSelector).click(function (e) {
        e.preventDefault();
        let id = e.target.dataset.id;
        c.deleteLinkForm.action = c.deleteLinkForm.dataset.actionDefault.replace('-1', id);
        c.deleteLinkIdElem.value = id;
        $(c.deleteLinkModalSelector).modal('show');
    });

    $(delBtn).click(function (e) {
        e.preventDefault();
        if (!c.deleteLinkConfirmElem.checked) {
            errorMessageAdd($(c.deleteLinkConfirmElem), 'Необходимо подтвердить удаление');
            return;
        }

        sendPostRequest('#' + c.deleteLinkForm.id, c.deleteLinkForm.action, { shortLinkId: +c.deleteLinkIdElem.value }, null, null, 'DELETE');
    });

});