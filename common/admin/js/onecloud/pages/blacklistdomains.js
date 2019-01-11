const blacklistConfig = {
    addZoneForm: document.querySelector('#add-blacklistdomain-form'),
    addZoneInput: document.querySelector('[name="DnsZoneName"]'),
    deleteZoneBtnSelector: '[id*="zone-remove"]',
    deleteZoneModalSelector: '#remove-blacklistdomain-modal',
    deleteZoneForm: document.querySelector('#remove-blacklistdomain-form'),
    deleteZoneIdElem: document.querySelector('#dnsZoneId'),
    deleteZoneConfirmElem: document.querySelector('#remove-blacklist-zone-confirm')
};
$(function () {
    let c = blacklistConfig;
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