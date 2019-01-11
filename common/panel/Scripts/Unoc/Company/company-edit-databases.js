/*
 * variables companyId,  calc, prevOrder are defined in Edit view
 */

var configList = calc.Tariff.Configurations;
var dbsBlockId = '#unoc-company-dbs',
    dbsListId = '#unoc-dbs-list',
    dbsListSelector = '.unoc__dbs',
    dbsItemSelector = '.unoc__dbs-item',
    dbsTitleSelector = '.unoc__dbs-config',
    dbsNameSelector = '.unoc__dbs-name-input',
    dbsSelectSelector = '.unoc__dbs-select',
    dbsTypeSelector = '.unoc__dbs-type-input',
    dbsUpdateSelector = '.unoc__dbs-update-checkbox',
    dbsUpdateLabelSelector = '.unoc__dbs-update-label',
    dbsSizeSelector = '.unoc__dbs-size',
    dbsDeleteNewSelector = '.unoc__dbs-delete-new',
    dbsDeleteCurSelector = '.delete-cur-db',
    dbsAddSelector = '#add-unoc-db',
    dbsBtnSaveId = '#unoc-company-dbs-btn',
    dbsDeleteWarn = '#warning-delete-existing-db',
    dbsExtraCostId = '#unoc-edit-dbs-cost',
    initDbNamesArr = [];

$(function () {
    $(dbsItemSelector).each(function () {
        var titleObj = $(this).find(dbsTitleSelector);
        if (typeof titleObj.data('config-id') !== 'undefined') {
            titleObj.text(getDbInfo(Number(titleObj.data('config-id'))).Title);
        };
    });
    $('.unoc__dbs-config-inp').each(function(){
        initDbNamesArr.push($(this).val());
    });
    
    $(dbsAddSelector).click(function (e) {
        e.stopPropagation();
        addDbRow();
    });
    $(dbsDeleteCurSelector).click(function (e) {
        e.preventDefault();
        var curRow = $(this).parents('.like-table__row');
        deleteCurDb(curRow);
    });

    $(dbsBtnSaveId).click(function (e) {
        e.preventDefault();
        sendDbsRequest();
    });
});

/*
 * Delete existing database
 */
function deleteCurDb(row) {
    var delBlock = row.find('.unoc__dbs-delete');
    row.addClass('alert-danger').data('action', 'Deleted');
    delBlock.find('.btn-delete').addClass('hidden');

    var cancelDelBtn = $('<a/>', {
        'class': 'glyphicon glyphicon-ban-circle unoc__btn-cancel unoc__btn-pointer',
        'title': resources.Cancel_Delete,
        click: function (e) {
            e.preventDefault();
            $(this).remove();
            cancelDelete(row);
        }
    });
    delBlock.append(cancelDelBtn);
    $(dbsDeleteWarn).removeClass('hidden');
};

function cancelDelete(row){
    row.removeClass('alert-danger').data('action', 'NoAction');
    row.find('.btn-delete').removeClass('hidden');
    $(dbsDeleteWarn).addClass('hidden');
}

/*
 * Adds new configuration row 
 */
function addDbRow() {
    var tpl = document.getElementById('template-unoc-add-db'),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        isEmptySelects = false;

    $(dbsListId + ' ' + dbsSelectSelector).each(function () {
        if ($(this).val() === '') {
            isEmptySelects = true;
        }
    });

    if (isEmptySelects) {
        errorMessageAdd($(dbsListSelector), resources.ErrorAddDb);
    } else {
        var newDbElem = tplContainer.querySelector(dbsItemSelector).cloneNode(true),
            newDbElemId = Math.ceil(Math.random() * 1000);

        /*
            $(newDbElem).find(dbsUpdateSelector).attr('id', 'autoUpdate-' + newDbElemId);
            $(newDbElem).find(dbsUpdateLabelSelector).attr('for', 'autoUpdate-' + newDbElemId);
        */

        initDbSelect($(newDbElem).find(dbsSelectSelector));

        $(newDbElem).find(dbsDeleteNewSelector).append($('<a />', {
            class: 'btn-delete delete-new-db',
            'title': resources.Delete,
            'href': '#',
            click: function (e) {
                e.preventDefault();
                $(newDbElem).remove();
                calculateDbAdditionalCost();
            }
        }));
        $(dbsListSelector).append($(newDbElem));
        $(newDbElem).find(dbsSelectSelector).chosen({ disable_search_threshold: 10, width: '260px' }).change(function (e, params) {
            calculateDbAdditionalCost();
        });

    }
}

/*
 * Fills select with calc config values
 * @obj selectObj - jQuery object of select in a concrete Db item row
 */
function initDbSelect(selectObj) {
    for (var i = 0; i < configList.length; i++) {
        selectObj.append($('<option/>', {
            'text': configList[i].Title,
            'value': configList[i].Id
        }));
    }
}

/*
 * Gets configuration object
 * @number confId - id of selected configuration
 */
function getDbInfo(confId) {
    var tariff = configList.filter(function (el) {
        return el.Id === confId;
    });
    return tariff[0];
}

/*
 * Calculates additional price if new configurations are presented
 */
function calculateDbAdditionalCost() {
    var result = 0;

    $(dbsListId + ' ' + dbsSelectSelector).each(function () {
        if ($(this).val() !== '') {
            result += (prevOrder.users * getDbInfo(Number($(this).val())).PricePerUser);;
        }
    });

    if (result === 0) {
        $(dbsExtraCostId).parent().addClass('hidden');
    } else {
        $(dbsExtraCostId).text(result);
        $(dbsExtraCostId).parent().removeClass('hidden');
    }
}

$(dbsNameSelector).change(function (e) {
    var row = $(this).parents(dbsItemSelector);
    row.data('action', 'Modified');
});

/*
 * Gets dbs post object
 */
function getDbsObj() {
    var postObj = {};

    postObj.companyId = companyId;
    postObj.Infobases = [];

    $(dbsListId + ' ' + dbsItemSelector).each(function () {
        
            var item = {},
                isNew = $(this).find(dbsSelectSelector).length;

            item.ConfigurationId = (isNew) ? parseInt($(this).find(dbsSelectSelector).val()) : $(this).find(dbsTitleSelector).data('config-id');
            if (!isNew) {
                item.Id = $(this).find(dbsNameSelector).data('id')
            };
            item.TypeUnocDb = $(this).find(dbsTypeSelector + ':checked').val();
            item.Name = $(this).find(dbsNameSelector).val();
            item.IsAutoUpdateEnabled = true; // hack for now. when this feature wiil be enabled, must be $(this).find(dbsUpdateSelector).prop('checked')
            item.Action = $(this).data('action');
            item.Size = 0; // hack for now. when this feature wiil be enabled, must be $(this).find(dbsSizeSelector).data('size')
            
            postObj.Infobases.push(item);
    });
    return postObj;
}
var validateDbForm = {
    fullCheck: function () {
        if (validateDbForm.checkConfigurations()) {
            errorMessageAdd($(dbsListSelector), resources.ErrorEmptyDb);
            return;
        };
        if (validateDbForm.checkDbNames()) {
            errorMessageAdd($(dbsListSelector), resources.Unoc_Company_No_Similar_Dbnames);
            return;
        };
        if (validateDbForm.emptyDbName()) {
            errorMessageAdd($(dbsListSelector), resources.Unoc_Company_No_Empty_Dbnames);
            return;
        };
        return true
    },
    checkConfigurations: function() {
        var isEmptyconfigurations = false;

        $(dbsListId + ' ' + dbsSelectSelector).each(function () {
            if ($(this).val() === '') {
                isEmptyconfigurations = true;
            }
        });
        return isEmptyconfigurations;
    },
    checkDbNames: function() {
        var dbNameArr = []

        var infobasesArr = getDbsObj();
        
        infobasesArr.Infobases.forEach(function (el) {
            dbNameArr.push(el.Name);
        });
        
        function hasDuplicates(array) {
            var isDuplicate = false;
            for (var i = 0; !isDuplicate && i < array.length; i++) {
                if (array[i] != '') {
                    isDuplicate = array.indexOf(array[i], i + 1) !== -1;
                }
            }
            return isDuplicate;
        }
        return hasDuplicates(dbNameArr)
    },
    emptyDbName: function () {
        var isEmpty = false,
            infobasesArr = getDbsObj();
        
        infobasesArr.Infobases.forEach(function (el) {
            if(el.Name == ''){
                isEmpty = true;
            }
        });
        return isEmpty
    }
};
/*
 * Validates and send databases edit request
 */
function sendDbsRequest() {
    if (validateDbForm.fullCheck()){
        sendAjaxRequest(dbsBlockId, $(dbsBlockId).data('action'), getDbsObj(), function () {
            location.reload();
        }, showDbsError, 'PUT');
    }
}

/*
 * Shows databases update response error
 * @obj data - server response
 */
function showDbsError(data) {
    handleAjaxErrors(data, dbsBlockId);
}