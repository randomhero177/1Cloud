$(function () {
    var csrFormId = '#csr-generate-form',
    csrForm = $(csrFormId),
    csrCountrySelect = csrForm.find('#Country'),
    csrFormBtn = csrForm.find('#csr-generate-btn'),
    processClass = 'loading';

    /*
     * CSR generation progress function
     */
    function showCsrProcess() {
        csrFormBtn.addClass(processClass);
    }

    /*
     * CSR generation success function
     * @object data - result object, returned from server with status code 200
     */
    function showCsrSuccess(data) {
        csrFormBtn.removeClass(processClass);

        $('#csr-generate-result').val(data.CsrCode);
        $('#csr-generate-rsa').val(data.PrivateKey);
        $('#csr-result').removeClass('hidden');
        $('#csr-text').addClass('hidden');

        addDownloadListener('#csr-download-form', '#csr-download-btn', data);

        if (window.innerWidth < 768) {
            scrollTo('#csr-result');
        }
    }

    /*
     * CSR generation error function
     * @object data - result object, returned from server with status code 400
     */
    function showCsrError(data) {
        csrFormBtn.removeClass(processClass);
    }

    /*
     * Unbinds old click event and Binds click to download current CSR & RSA
     * @object data - result object, returned from server with status code 200
     * @string formId - id attribute of a download ZIP CSR form
     * @string btnId - id attribute of a download ZIP CSR control element
     */
    function addDownloadListener(formId, btnId, data) {
        $(btnId).unbind('click');
        $(btnId).bind('click', function (e) {
            e.preventDefault();
            sendPostRequest(formId, $(formId).attr('action'), data);
        })
    }

    /******** CSR "CONTROLLER" ***********/
    if (csrCountrySelect && window.innerWidth > 767) {
        csrCountrySelect.selectpicker({ 'width': '100%', dropupAuto: false });
    }

    csrFormBtn.click(function (e) {
        e.preventDefault();
        if (!csrFormBtn.hasClass(processClass)) {
            checkCsrFieldsEmpty(csrFormId);

            if (csrForm.find(errorElemSelector).length < 1) {
              var csrPostObj = preparePostCsrObject();

              sendSimplePostRequest(csrForm.attr('action'), addRequestVerificationToken(csrFormId, csrPostObj), showCsrSuccess, showCsrProcess, showCsrError);
            }
        }
    });

    $('#csr-generate-result, #csr-generate-rsa').on('click', function () {
        this.select();
    });
});

/*
 * Checks CSR fields for non-emptiness
 * @string csrFieldsBlockId - ID of csr fields container
 */
function checkCsrFieldsEmpty(csrFieldsBlockId) {
    $(csrFieldsBlockId + ' input').each(function () {
        if ($(this).val() === '' && !$(this).parent().hasClass('hidden') && !$(this).parent().hasClass('error')) {
            errorMessageAdd($(this), textRequired);
        }
    });
}
/*
* Returns prepared CSR object, based on values of HTML tags with corresponding ID attributes
*/
function preparePostCsrObject() {
    var Csr = {};
    Csr.Domain = $('#Domain').val();
    Csr.Organization = $('#Organization').val();
    Csr.Country = $('#Country').val();
    Csr.State = $('#State').val();
    Csr.City = $('#City').val();
    Csr.Department = $('#Department').val();
    Csr.Email = $('#Email').val();

    return Csr;
}