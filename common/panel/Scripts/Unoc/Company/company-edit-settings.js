/*
 * variables companyId,  calc, prevOrder are defined in Edit view
 */
var diskConf = calc.DiskConfig;

var settBlockId = '#unoc-company-settings',
    settBtnSaveId = '#unoc-company-settings-btn',
    settNameInputSelector = '[name="CompanyName"]',
    settUserInputSelector = '[name="UserCount"]',
    settDiskInputSelector = '[name="DiskSize"]',
    settExtraCostId = '#unoc-edit-settings-cost',
    agreementInput = '#agreement-input',
    curCompanyName = $(settNameInputSelector).val();


$(function () {
    initSettingsAmounts();

    $(settBtnSaveId).click(function (e) {
        e.preventDefault();
        if ($(agreementInput).prop('checked')) {
            sendSettingsRequest();
        } else {
            errorMessageAdd($(agreementInput), resources.Unoc_ConfirmSettingsChange);
        }
        
    });
    
});

function initSettingsAmounts() {
    $(settUserInputSelector).prop('max', calc.UserMaxCount);
    $(settDiskInputSelector).prop('min', diskConf.DiskSizeMinGb);
    $(settDiskInputSelector).prop('max', diskConf.DiskSizeMaxGb);
    $(settDiskInputSelector).prop('step', diskConf.DiskSizeStepGb);

    $('.amount').each(function () {
        var amount = new Amount(this, changeSettingsValues, changeSettingsValues);
    });
}

/*
 * Callback function for amount controls press actions
 */
function changeSettingsValues() {
    calculateSettAdditionalCost();
}

/*
 * Calculates additional price if settings are changed
 */
function calculateSettAdditionalCost() {
    var usersCount = Number($(settUserInputSelector).val()),
        diskCount = Number($(settDiskInputSelector).val());

    var result = 0;
    var usersCount = Number($(settUserInputSelector).val()),
    diskCount = Number($(settDiskInputSelector).val()),
    userCalc = {
        PricePerOne: calc.Tariff.PricePerOne,
        PricePerOthers: calc.Tariff.PricePerOthers
    },
    discCalc = {
        TariffDisk: calc.DiskConfig.TariffDisk,
        DiskSpaceForFree: calc.DiskConfig.DiskSpaceForFree
    }
    var priceUsers = userCalc.PricePerOne + (usersCount - 1) * userCalc.PricePerOthers,
        priceDisk = (diskCount - discCalc.DiskSpaceForFree) * discCalc.TariffDisk,
        result = priceUsers + priceDisk;
        $(settExtraCostId).text(result);
        $(settExtraCostId).parent().removeClass('hidden');
}

/*
 * Checks if there are changes in settings, and depending on this ables/disables Save button
 */
/*
function checkSaveSettBtnDisabled() {
    var isChanges = false,
        newCompanyName = $(settNameInputSelector).val();
    if ($(settUserInputSelector).val() != globalConfig.maxUsers || $(settDiskInputSelector).val() != prevOrder.disk || curCompanyName !== newCompanyName) {
        isChanges = true;
    }

    $(settBtnSaveId).prop('disabled', !isChanges);
}
*/

function getSettingsObj() {
    var postObj = {};

    postObj.companyId = companyId;
    postObj.model = {};
    postObj.model.CompanyName = $(settNameInputSelector).val();
    postObj.model.MaxUserCount = $(settUserInputSelector).val();
    postObj.model.DiskSize = $(settDiskInputSelector).val();

    return postObj;
}

/*
 * Validates and send settings edit request
 */
function sendSettingsRequest() {

    if ($(settNameInputSelector).val() === '') {
        errorMessageAdd($(settNameInputSelector), resources.Required);
        return;
    }

    if (Number($(settUserInputSelector).val()) < prevOrder.users) {
        errorMessageAdd($(settUserInputSelector).parent(), resources.ErrorDecreaseUsers);
        return;
    }

    sendAjaxRequest(settBlockId, $(settBlockId).data('action'), getSettingsObj(), function () {
        location.reload();
    }, showSettingsError, 'PUT');
}

/*
 * Shows settings update response error
 * @obj data - server response
 */
function showSettingsError(data) {
    console.log(data);
}