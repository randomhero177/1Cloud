'use strict';

var Payments = {
    config: {
        layoutId: 'payments-layout',
        layoutEmptyId: 'payments-layout-empty',
        dailyId: 'payments-daily-table',
        dailyTotalId: 'payments-total',
        listId: 'payments-list-table',
        filterFormId: 'payments-filter'
    },
    filter: {
        obj: {},
        config: {},
        submit: function () {
            Payments.list.load();
        },
        init: function () {
            this.obj = new Filter(Payments.config.filterFormId, this.submit);
            this.obj.init();
            this.config.form = document.getElementById(Payments.config.filterFormId);
            initMonthpicker();

            function initMonthpicker() {
                var form = document.getElementById(Payments.config.filterFormId);
                var inputMonth = form.querySelector('[name="Month"]');
                var inputYear = form.querySelector('[name="Year"]');
                $("#monthpicker").monthpicker({
                    changeYear: false,
                    stepYears: 1,
                    prevText: '<i class="fa fa-chevron-left"></i>',
                    nextText: '<i class="fa fa-chevron-right"></i>',
                    dateFormat: 'MM yy',
                    beforeShow: function (input, inst) {
                        var newclass = 'admin-form';
                        var themeClass = $(this).parents('.admin-form').attr('class');
                        var smartpikr = inst.dpDiv.parent();
                        if (!smartpikr.hasClass(themeClass)) {
                            inst.dpDiv.wrap('<div class="' + themeClass + '"></div>');
                        }
                    },
                    onSelect: function (input, inst) {
                        inputMonth.value = inst.selectedMonth + 1;
                        inputYear.value = inst.selectedYear;
                    }
                });
                $("#monthpicker").val($.monthpicker.formatDate('MM yy', new Date(window.util.getTwoDigitsDate(Number(inputMonth.value)) + '/01/' + inputYear.value)));
            }
        }
    },
    list: {
        load: function () {
            $.get(Payments.filter.config.form.action, Payments.filter.obj.getFilterObj(), function (data) {
                Payments.list.drawPaymentsLists(data);
            }).fail(function (data) {
                console.log('Error getting payments');
                handleAjaxErrors(data, '#' + Payments.config.filterFormId);
            });
        },
        drawPaymentsLists: function (data) {
            var list = Payments.list,
                layout = document.getElementById(Payments.config.layoutId);

            layout.parentNode.classList.add('loading', 'loading--full');
            if (data.Payments.length) {
                list.drawPaymentsDaily(data.PaymentsAmountByDay);
                list.drawPaymentsList(data.Payments);
                document.getElementById(Payments.config.dailyTotalId).textContent = data.PaymentsAmount.toLocaleString();

                setCorrectCurrency(layout, data.Currency);
            }
            list.checkNoResults(data.Payments.length < 1);
            layout.parentNode.classList.remove('loading', 'loading--full');

            function setCorrectCurrency(block, currency) {
              let node = (block) ? block : document;
              [].forEach.call(node.querySelectorAll('.price'), function (el) {
                el.removeAttribute('class');
                el.setAttribute('class', 'price price--' + currency.toLowerCase());
              });
            }
        },
        drawPaymentsDaily: function (payList) {
            var table = document.getElementById(Payments.config.dailyId),
                tableBody = table.querySelector('tbody'),
                newTbody = document.createElement('tbody'),
                itemTemplate = document.getElementById('payment-daily-row-template').content;

            payList.forEach(function (el) {
                let item = itemTemplate.cloneNode(true);
                item.querySelector('.payment__row-day').textContent = el.Day;
                item.querySelector('.payment__row-day-amount .price').textContent = el.Amount.toLocaleString();
                newTbody.appendChild(item);
            });

            tableBody.parentNode.replaceChild(newTbody, tableBody);
        },
        drawPaymentsList: function (payList) {
            var table = document.getElementById(Payments.config.listId),
                tableBody = table.querySelector('tbody'),
                newTbody = document.createElement('tbody'),
                itemTemplate = document.getElementById('payment-list-row-template').content;

            payList.forEach(function (el) {
                let item = itemTemplate.cloneNode(true);
                let customerLink = item.querySelector('.payment__customer-link');
                let invoiceElem = item.querySelector('.payment__type-extra');
                let invoiceLink = invoiceElem.querySelector('.payment__invoice-link');
                
                item.querySelector('.payment__row-datecreate').textContent = window.util.formatDate(new Date(el.DateCreate));
                item.querySelector('.payment__row-customerid').textContent = el.CustomerId;
                item.querySelector('.payment__row-customerbalance .price').textContent = el.CustomerBalance.toLocaleString();
                item.querySelector('.payment__row-amount .price').textContent = el.Amount.toLocaleString();
                item.querySelector('.payment__type').textContent = el.PaymentType;
                customerLink.textContent = el.CustomerEmail;

                if (el.InvoiceNumber) {
                    invoiceLink.textContent = el.InvoiceNumber;
                } else {
                    invoiceElem.remove();
                }

                if (Array.isArray(el.Links)) {
                    let invoiceHref = el.Links.filter((el) => el.Rel == 'invoice');
                    if (invoiceHref.length) {
                        invoiceLink.href = invoiceHref[0].Url;
                    }
                    customerLink.href = el.Links.filter((el) => el.Rel == 'customer')[0].Url;
                }
                newTbody.appendChild(item);
            });

            tableBody.parentNode.replaceChild(newTbody, tableBody);
        },
        checkNoResults: function (isEmpty) {
            var layout = document.getElementById(Payments.config.layoutId),
                layoutEmpty = document.getElementById(Payments.config.layoutEmptyId);

            if (typeof isEmpty === 'boolean' && isEmpty) {
                layout.classList.add('hidden');
                layoutEmpty.classList.remove('hidden');
            } else {
                layout.classList.remove('hidden');
                layoutEmpty.classList.add('hidden');
            }
        }
    },
    init: function () {
        this.filter.init();
        this.list.load();
    }
}

Payments.init();