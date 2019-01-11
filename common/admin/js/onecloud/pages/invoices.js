'use strict';

var Invoices = {
    config: {
        filterFormId: 'invoices-filter',
        invoicesContainerId: 'invoices',
        invoicesListId: 'invoices-table',
        invoicesListUrl: 'list'
    },

    /*
     * Returns correct url for ajax requests. Doesn't depend on the fact if there is a slash in the end of window.location.pathname
     * @string appendix - a string to be added to path name
     */
    makeCorrectUrl: function (appendix) {
        return window.location.origin + window.location.pathname + ((window.location.pathname.slice(-1) === '/') ? '' : '/') + appendix;
    },
    filter: {
        obj: {},
        config: {},
        submit: function () {
            Invoices.item.curCustomer = {};
            Invoices.item.invoiceBlock.classList.remove('main-list__info--active');
            Invoices.list.load();
        },
        init: function () {
            Invoices.filter.obj = new Filter(Invoices.config.filterFormId, Invoices.filter.submit);
            Invoices.filter.obj.init();
            var config = Invoices.filter.config;
            config.form = document.getElementById(Invoices.config.filterFormId);
            config.canFilterByPartner = config.form.dataset.partnerFilter.toLowerCase();
            config.level = config.form.dataset.level;
        }
    },
    list: {
        /*
         * Loads invoices list due to filter values
         */
        load: function () {
            $.get(Invoices.makeCorrectUrl(Invoices.config.invoicesListUrl), Invoices.filter.obj.getFilterObj(), function (data) {
                Invoices.list.drawInvoicesList(data);
            }).fail(function (data) {
                handleAjaxErrors(data);
                console.log('Error getting invoices');
            });
        },
        /*
         * Draw invoices table due to server's response
         * @obj data - object from server with invoices object list
         */
        drawInvoicesList: function (data) {

            var container = document.getElementById(Invoices.config.invoicesContainerId),
                table = document.getElementById(Invoices.config.invoicesListId),
                noResults = container.querySelector('.table--no-results'),
                list = table.querySelector('.invoices__row-list');

            container.parentNode.classList.add('loading', 'loading--full');
            setTimeout(function () {
                while (list.firstChild) {
                    list.removeChild(list.firstChild);
                }
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        list.appendChild(Invoices.list.drawSingleCustomer(i, data[i]));
                    }
                    table.classList.remove('hidden');
                    noResults.classList.add('hidden');

                    if (data.length === 1) {
                        Invoices.item.load(data[0].InvoiceId);
                    }
                } else {
                    table.classList.add('hidden');
                    noResults.classList.remove('hidden');
                }

                container.parentNode.classList.remove('loading', 'loading--full');
            }, 1000);

        },
        /*
            * Returns DOM object of a single ticket item
            * @number index - index of a single ticket object in a tickets list
            * @obj ticket - object of a single ticket data
        */
        drawSingleCustomer: function (index, invoice) {
            var tpl = document.getElementById('invoice-row-template'),
                tplContainer = 'content' in tpl ? tpl.content : tpl,
                elem = tplContainer.querySelector('tr').cloneNode(true);

            elem.dataset.id = invoice.InvoiceId;
            
            window.util.fillDetalization('', invoice, elem);
            window.util.convertContentToThousands(elem.querySelector('.invoices__row-balance'));

            elem.querySelector('.status-label').classList.add('status', 'status--' + invoice.State);
            
            elem.addEventListener('click', function () {
                if (invoice.InvoiceId !== Invoices.item.curCustomer.InvoiceId) {
                    var rows = document.querySelectorAll('.invoices__row');
                    for (var i = 0; i < rows.length; i++) {
                        rows[i].classList.remove('active');
                    }
                    this.classList.add('active');
                    Invoices.item.load(invoice.InvoiceId);
                }
            });

            if (invoice.InvoiceId === Invoices.item.curCustomer.InvoiceId) {
                elem.classList.add('active');
            };
            return elem;
        }
    },
    item: {
        config: {
            fields: {
                dateCreated: document.getElementById('invoice-date'),
                IsCanPaid: document.getElementById('addbankpayment-wrap')
            },
            controls: {
                hold: {
                    elem: document.getElementById('ticket-hold-btn')
                }
            },
            actions: {
                addBankPayment: {
                    url: '/addbankpayment',
                    elem: document.getElementById('addbankpayment-btn'),
                    addInput: '<label for="AddMoney">Номер платежа</label><br><input type="text" id="addBankPayment-inp" name="addBankPayment-inp" placeholder="0" class="form-control mt20">',
                    modal: {
                        title: 'Принять платеж',
                        introtext: '(Платеж будет переведен в состояние оплачен. Сумма счета будет начислена на лицевой счет клиента)',
                        hiddenComment: false,
                        btnText: 'Принять платеж'
                    }
                }

            },
            curAction: ''
        },

        interval: false,
        curCustomer: {},
        invoiceBlock: document.getElementById('invoice-info'),
        summaryControl: document.getElementById('invoice-summary-collapse-btn'),
        filterControl: document.getElementById('collapse-filter-btn'),
        summaryBlock: document.getElementById('invoice-summary'),
        detailBlock: document.getElementById('invoice-detail'),
        descriptionBlock: document.getElementById('invoice-description'),
        holdedAlertElems: document.querySelectorAll('.invoices__header-alert'),
        actionsBlock: document.getElementById('invoice-actions'),
        actionsBlockModal: document.getElementById('modal-actions'),
        load: function (id) {
            $.get(Invoices.makeCorrectUrl(id), function (data) {
                var item = Invoices.item;
                item.curCustomer = data;
                item.actionsBlock.classList.remove('tickets__actions--active');
                item.fillCustomerInfo(data);

            }).fail(function (data) {
                console.log('Error loading invoice');
                handleAjaxErrors(data);
            });
        },
        fillCustomerInfo: function (invoiceInfo) {
            var invoiceBlock = Invoices.item.invoiceBlock,
                invoiceCreated = new Date(invoiceInfo.DateCreate),
                invoiceFields = Invoices.item.config.fields,
                invoiceActions = Invoices.item.config.actions;

            invoiceBlock.classList.remove('main-list__info--active');

            setTimeout(function () {
                // FILL TEXT INFO
                
                window.util.fillDetalization('invoice-summary', invoiceInfo);
                window.util.fillDetalizationLinks('invoice-summary', invoiceInfo.Links);
                invoiceFields.dateCreated.textContent = window.util.formatDate(invoiceCreated);
                window.util.setElementVisibility(invoiceFields.IsCanPaid, invoiceInfo.IsCanPaid);

                // SHOW INVOICE'S INFO

                invoiceBlock.classList.add('main-list__info--active');
            }, 100);
        },

        /*
         * Inits all invoice buttons behaviour
         */
        initButtons: function () {
            var config = Invoices.item.config,
                controls = config.controls,
                actions = config.actions;
                
            for (var item in actions) {
                actions[item].elem.dataset.action = item;
                actions[item].elem.addEventListener('click', function () {
                    var action = this.dataset.action;
                    Invoices.modal.clear();
                    Invoices.modal.fill(Invoices.item.config.actions[action], action);
                    Invoices.modal.curAction = action;
                    $(Invoices.modal.config.mBlock).modal('show');
                    Invoices.modal.removeErrors();
                });
            };
        },
        showDescription: function () {
            Invoices.item.detailBlock.classList.remove('hidden');
            Invoices.item.summaryControl.classList.remove('main-list__summary-collapse-btn--collapsed');
        },
        /*
         * Toggles ticket description block's visibility
         */
        toggleDescription: function () {

            Invoices.item.detailBlock.classList.toggle('hidden');
            Invoices.item.summaryControl.classList.toggle('main-list__summary-collapse-btn--collapsed');
        }
    },
    modal: {
        curAction: '',
        config: {
            mFormId: 'invoice-comment-form',
            mForm: document.getElementById('invoice-comment-form'),
            mBlock: document.getElementById('modal-comment'),
            mInput: document.getElementById('invoice-inputs-block'),
            mTitle: document.getElementById('comment-title'),
            mIntro: document.getElementById('comment-intro'),
            mHidden: document.getElementById('comment-hidden'),
            mText: document.getElementById('comment-text'),
            mClose: document.getElementById('close-form'),
            mDropzone: false,
            mSendBtn: document.getElementById('comment-send')
        },
        /*
         * Fills modal window with the information, corresponding to the cliked button
         * @number ticketId - id of a ticket, to which modal is called for
         * @obj action - object of the chosen action
         */
        fill: function (actionObj, actionName) {
            var mConfig = Invoices.modal.config;
            mConfig.mTitle.textContent = actionObj.modal.title;
            mConfig.mText.textContent = actionObj.modal.introtext;
            mConfig.mSendBtn.textContent = actionObj.modal.btnText;
            mConfig.mForm.action = Invoices.makeCorrectUrl(actionObj.url);

            if (actionObj.addInput) {
                mConfig.mInput.innerHTML = actionObj.addInput;
            };

            $(mConfig.mForm).unbind('submit').bind('submit', function (event) {
                event.preventDefault();
                Invoices.modal.removeErrors();
                Invoices.modal.submit(Invoices.item.curCustomer.InvoiceId, this);
            });
        },
        submit: function (invoice, form) {
            var formInp = form.querySelector('.form-control');
            var sendObj = {};
            sendObj.InvoiceId = invoice;
            sendObj.PaymentNumber = formInp.value;
            sendPostRequest('#' + form.id, form.action, sendObj, Invoices.modal.onSuccess, Invoices.modal.onFail);
        },
        clear: function () {
            var mConfig = Invoices.modal.config;
            mConfig.mInput.innerHTML = '';
            Invoices.item.config.curAction = '';
            Invoices.modal.curAction = '';
        },
        onSuccess: function (data) {
            successPopup('success-pop-up', 'invoice-summary', true);
            $(Invoices.modal.config.mBlock).modal('hide');
            Invoices.list.load();
            Invoices.modal.clear();
        },
        onSuccessCheck: function (data) {
            var checkState = document.createElement('h3');
            checkState.id = 'check-invoice-state';
            if (!data.isDanger) {
                var textnode = document.createTextNode('Безопасный');
            } else {
                var textnode = document.createTextNode('Не безопасный');
            };
            checkState.appendChild(textnode);
            if (document.getElementById('check-invoice-state') == null) {
                document.getElementById('invoice-inputs-block').appendChild(checkState);
            }
        },
        onFail: function (data) {
            handleAjaxErrors(data, '#' + Invoices.modal.config.mFormId);
            Invoices.modal.addErrorClass();
        },
        removeErrors: function () {
            var errParentBlock = document.getElementById(Invoices.modal.config.mFormId);
            var errChild = errParentBlock.getElementsByClassName(errorSummaryClass);
            while (errChild.length > 0) {
                errChild[0].parentNode.removeChild(errChild[0]);
            }
        },
        addErrorClass: function () {
            var errChild = document.getElementsByClassName(errorSummaryClass);
            if (errChild.length > 0) {
                for (var i = 0; errChild.length > i; i++) {
                    errChild[i].classList.add('alert', 'alert-danger');
                }
            }
        }
    },
    init: function () {
        this.makeCorrectUrl('');
        this.filter.init();
        this.list.load();
        this.item.initButtons();
        this.item.summaryControl.addEventListener('click', this.item.toggleDescription);
        hackForActiveSidebarMenu();
        function hackForActiveSidebarMenu() {
            var arrLinks = document.querySelectorAll('.sidebar-menu .tickets-menu .sub-nav > li a');
            for (var i = 0; i < arrLinks.length; i++) {
                if (window.location.href.indexOf(arrLinks[i].getAttribute('href')) !== -1) {
                    arrLinks[i].parentNode.classList.add('active');
                    return;
                }
            }
        }
    }
}
Invoices.init();