const whitelistConfig = {
    addZoneForm: document.querySelector('#add-whitelistdomain-form'),
    addZoneInput: document.querySelector('[name="DnsZoneName"]'),
    deleteZoneBtnSelector: '[id*="zone-remove"]',
    deleteZoneModalSelector: '#remove-whitelistdomain-modal',
    deleteZoneForm: document.querySelector('#remove-whitelistdomain-form'),
    deleteZoneIdElem: document.querySelector('#dnsZoneId'),
    deleteZoneConfirmElem: document.querySelector('#remove-whitelist-zone-confirm')
};
$(function () {
    let c = whitelistConfig;
    let delBtn = c.deleteZoneForm.querySelector('.btn-primary');

    $(c.addZoneForm).submit(function (e) {
        e.preventDefault();
        sendPostRequest('#' + c.addZoneForm.id, c.addZoneForm.action, { DnsZoneName: c.addZoneInput.value });
    });

    $(c.deleteZoneBtnSelector).click(function (e) {
        e.preventDefault();
        let id = e.target.dataset.id;
        c.deleteZoneForm.action = c.deleteZoneForm.dataset.actionDefault.replace('-1', id);
        c.deleteZoneIdElem.value = id;
        $(c.deleteZoneModalSelector).modal('show');
    });

    $(delBtn).click(function (e) {
        e.preventDefault();
        if (!c.deleteZoneConfirmElem.checked) {
            errorMessageAdd($(c.deleteZoneConfirmElem), 'Необходимо подтвердить удаление');
            return;
        }

        sendPostRequest('#' + c.deleteZoneForm.id, c.deleteZoneForm.action, { dnsZoneId: +c.deleteZoneIdElem.value });
    });
});