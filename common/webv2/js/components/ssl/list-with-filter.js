$(function () {
    var sslItemsContainer = $('#ssl-list'),
        sslItemsNumber = sslItemsContainer.find('.ssl__item').length;
    var vendors = new Array();
    var sslSortItems = new Array();

    var selects = {};
    selects.Vendor = $('#ssl-select-vendor');
    selects.Type = $('#ssl-select-type');
    selects.Options = $('#ssl-select-options');


    /* ************  ************* */
    stripeOddItems();
    initializeSslFilter();

    function initializeSslFilter() {
        $('.ssl__item').each(function () {
            formatItemThousands($(this));
            addItemToPricesArray($(this));
            //pushVendorToArray($(this).data('ssl-vendor'));
        });
        setStoredFilterOptionToSelects();
        //generateSelectCompany();
        generateSelectType();
        generateSelectOptions();
        filterChanged();

        /*======================== SSL SORT LIST  =======================*/
        $('.ssl__item-sortable').click(function () {
            sortSslList($(this));
        });

        /*======================== SSL READMORE  =======================*/
        $('.ssl__readmore').click(function (e) {
            e.preventDefault();
            sslInfoShow($(e.target));
        });
        $('.ssl__info-close').click(function () {
            sslInfoClose();
        });

        $('.ssl__item').click(function (e) {
            if (!e.target.classList.contains('btn')) {
                $(this).toggleClass('ssl__item--active');
            }
        });

        $(window).resize(function () {
            // Make ssl-list sorted on mobile devices by price asc by default
            if (window.innerWidth < 768) {
                $('.ssl__item-sortable').removeClass('ssl__item-sortable--active');
                $('.ssl__item-cost').attr('data-dir', 'asc');
                sortSslList($('.ssl__item-cost'));
            }
        });
    }

    /* ************ SORTING FUNCTIONS ************* */  // list of certificates comes from backend sorted by price ASC
    function addItemToPricesArray(item) {
        sslSortItems.push({ 'id': item.attr('id'), 'price': item.data('price'), 'rating': item.data('rating') });
    }
    function sortPriceArray(dir, parameter) {
        var param = (typeof parameter === 'undefined') ? 'price' : parameter;
        if (dir === 'asc') {
            sslSortItems.sort(function (a, b) { return a[param] - b[param] });
        } else {
            sslSortItems.sort(function (a, b) { return b[param] - a[param] });
        }
    }
    function redrawSortedSslList() {
        sslSortItems.forEach(function (item, i, sslSortItems) {
            sslItemsContainer.append($('#' + item.id));
        });
    }
    function changeSortDirection(trigger) {
        var newDir = (trigger.attr('data-dir') == 'asc') ? 'desc' : 'asc';
        return newDir;
    }
    function sortSslList(triggerObj) {
        var sortDir = triggerObj.attr('data-dir');;

        if (triggerObj.hasClass('ssl__item-sortable--active')) {
            sortDir = changeSortDirection(triggerObj);
            triggerObj.attr('data-dir', sortDir);
            triggerObj.toggleClass('ssl__item-sortable--desc');
        } else {
            $('.ssl__item-sortable').removeClass('ssl__item-sortable--active');
            triggerObj.addClass('ssl__item-sortable--active');
        }

        sortPriceArray(sortDir, triggerObj.data('sort-parameter'));
        redrawSortedSslList();
        stripeOddItems();
    }
    /* ************ FILTER FUNCTIONS ************* */
    
    function pushVendorToArray(item) {
        if (findInArr(vendors, item) == -1) {
            vendors.push(item);
        }
    }

    function setStoredFilterOptionToSelects() {
        var storedFilter = sessionStorage.getItem('selectedSslFilter');
        if (storedFilter) {
            $('.ssl__filter').find('option[value="' + storedFilter + '"]').prop('selected', true);
        }
    }
    function generateSelectCompany() {
        var opts = '';
        for (var i = 0; i < vendors.length; i++) {
            opts += '<option value="' + vendors[i] + '">' + vendors[i].charAt(0).toUpperCase() + vendors[i].slice(1).replace('_', ' ') + '</option>';
        }
        selects.Vendor.append(opts).selectpicker({ width: '100%' }).change(function (e, params) { filterChanged() });
    }
    function generateSelectType() {
        selects.Type.selectpicker({ width: '100%' }).change(function (e, params) { filterChanged() });
    }
    function generateSelectOptions() {
        selects.Options.selectpicker({ width: '100%' }).change(function (e, params) { filterChanged() });
    }

    function filterChanged() {
        var valV = selects.Vendor.val(),
            valT = selects.Type.val(),
            valO = selects.Options.val();

        for (var i = 0; i < sslItemsNumber; i++) {
            var item = $('.ssl__item').eq(i);

            if (filterCheck(item, 'vendor', valV) && filterCheck(item, 'type', valT) && filterCheck(item, 'options', valO)) {
                item.show();
            } else {
                item.hide();
            }
        }

        if (sslItemsContainer.find('.ssl__item:visible').length < 1) {
            $('#ssl-no-results').removeClass('hidden');
        } else {
            stripeOddItems();
            $('#ssl-no-results').addClass('hidden');
        }
    }
    function filterCheck(obj, attr, val) {
        return (obj.attr('data-ssl-' + attr) == val || val == '' || typeof val === 'undefined');
    }

    /* ************ DIFFERENT FUNCTIONS ************* */
    function stripeOddItems() {
        $('.ssl__item').removeClass('ssl__item--odd');
        $('.ssl__item:visible:odd').addClass('ssl__item--odd');
    }
    function formatItemThousands(certObj) {
        var price = certObj.find('.price__digits'),
            priceOld = certObj.find('.price__old');
        price.text(price.text().replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 "));
        if (priceOld) {
            priceOld.text(priceOld.text().replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 "));
        }
    }

    function sslInfoShow(linkObj) {
        var b = linkObj.attr('href');

        if (linkObj.hasClass('ssl__readmore--revealed')) {
            sslInfoClose();
        } else {
            if ($('.ssl__info:visible').length < 1) {
                $(b).show();
                $('.ssl__info').slideDown();
            } else {
                $('.ssl__info-item').hide();
                $(b).show();
            }

            $('.ssl__readmore').removeClass('ssl__readmore--revealed');
            linkObj.addClass('ssl__readmore--revealed');
        }
    }
    function sslInfoClose() {
        $('.ssl__info').slideUp();
        $('.ssl__info-item').hide('slow');
        $('.ssl__readmore').removeClass('ssl__readmore--revealed');
    }
});