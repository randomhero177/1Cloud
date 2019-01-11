/*
 * calc parameter is defined in the Create view - Calculator object
 * required jquery.quickWizard
 */

var UnocCreate = function () {
    var unoc = this;
    var model, view, controller;
    var config = {
        form: {
            formSelector: '#unoc-create-form',
            formBtnSelector: '#unoc-create-form-btn',
            switchFormLink: '.unoc-addUser__header-txt',
            formCompanyName: '[name="CompanyName"]'
        },
        dbs: {
            dbsBlockSelector: '#unoc-create-dbs',
            dbsListSelector: '.unoc__dbs',
            dbsItemSelector: '.unoc__dbs-item',
            dbsSelectSelector: '.unoc__dbs-select',
            dbsTypeSelector: '.unoc__dbs-type-input',
            dbsNameSelector: '.unoc__dbs-name-input',
            dbsUpdateSelector: '[name="IsAutoUpdateEnabled"]',
            dbsDeleteSelector: '.unoc__dbs-delete',
            dbsAddSelector: '#add-unoc-db'
        },
        users: {
            userBlockSelector: '#unoc-create-users',
            userListSelector: '.unoc__users',
            userItemSelector: '.unoc__users-item',
            userFirstnameSelector: '.unoc__users-firstname',
            userEmailSelector: '.unoc__users-email',
            userAccessSelector: '.unoc__users-access-input',
            userAccessLabelSelector: '.unoc__users-access-label',
            userAddSelector: '#add-unoc-user',
            userAutoGenerateBlockSelector: '#unoc-users-autogenerate',
            userAutoGenerateInputSelector: '#autogenerate-input',
            userAutoGenerateInputConfirmSelector: '#agreement-input',
            userNoOneSelector: '.unoc__users-no-one',
            userModalSelector: '#unoc-add-user-modal',
            userModalFormSelector: '#unoc-add-user-modal-form',
            userModalBtnSelector: '#unoc-add-user-modal-btn',
            userAddToArrayBtn: '.add-to-array',
            userListTable: '#users-choosen-table',
            userAddForm: '.unoc-addUser__form',
            userNewItem: 'unoc__new-user-item'
        },
        curUsers: [],
        summary: {
            sumUsersSelector: '#unoc-summary-users',
            sumDbsSelector: '#unoc-summary-dbs',
            sumDiskSelector: '#unoc-summary-disk',
            sumPriceSelector: '#unoc-summary-price'
        },
        calculator: {
            calcUsersSelector: '[name="UserCount"]',
            calcDiskSelector: '[name="DiskSize"]'
        },
        amount: [],
        prefix: 'UnocUsers'
    };

    this.Model = function () {
        var model = this;
        this.Order = {};

        this.getCurrentModel = function () {
            model.Order.CompanyName = $(config.form.formCompanyName).val();
            model.Order.MaxUserCount = $(config.calculator.calcUsersSelector).val();
            model.Order.DiskSize = $(config.calculator.calcDiskSelector).val();
            model.Order.IsAutoGenerateUsers = $(config.users.userAutoGenerateInputSelector).prop('checked');
            model.Order.UnocConfigurations = model.getConfigurations();
            model.Order.UnocUsers = model.getUsers();
        };

        this.getConfigurations = function () {
            var conf = config.dbs,
                items = $(conf.dbsBlockSelector + ' ' + conf.dbsItemSelector),
                result = new Array();

            if (items.length !== 0) {
                for (var i = 0; i < items.length; i++) {
                    if ($(items[i]).find(conf.dbsSelectSelector).val() !== '') {
                        var obj = {};
                        obj.ConfigurationId = $(items[i]).find(conf.dbsSelectSelector).val();
                        obj.Name = $(items[i]).find(conf.dbsNameSelector).val();
                        obj.TypeUnocDb = $(items[i]).find(conf.dbsTypeSelector + ':checked').val();
                        obj.IsAutoUpdateEnabled = $(items[i]).find(conf.dbsUpdateSelector).prop('checked');
                        result.push(obj);
                    }
                }
            }
            return result;
        };

        this.getUsers = function () {
            var conf = config.users,
                items = $(conf.userListTable + ' ' + conf.userItemSelector),
                result = new Array();

            if (items.length !== 0) {
                for (var i = 0; i < items.length; i++) {
                    if ($(items[i]).find(conf.userAccessSelector).prop('checked')) {
                        var obj = {};
                        
                        var thisItemhasInput = $(items[i]).find('.unoc__users-input-wrap input');
                        var isThisItemNew = (thisItemhasInput.length > 0) ? true : false;
                        obj.UserId = ($(items[i]).hasClass('unoc__new-user-item')) ? 0 : $(items[i]).data('id');
                        obj.Firstname = (isThisItemNew) ? $(items[i]).find('.unoc__users-firstname input').val() : $(items[i]).find(conf.userFirstnameSelector).text();
                        obj.Email = (isThisItemNew) ? $(items[i]).find('.unoc__users-email input').val() : $(items[i]).find(conf.userEmailSelector).text();
                        obj.IsAccessGranted = true;
                        result.push(obj);
                    }
                }
            }
            return result;
        };

        this.init = function () {
            model.getCurrentModel();
        };

        this.addUserToArray = function (elem) {
            var checkedRow = ($(elem).hasClass('unoc-addUser__form')) ? elem.find(config.users.userAccessSelector + ':checked').parents(config.users.userItemSelector) : $(elem);
            var existInArr = false,
                removeFromArr = false;
            for (var i = 0; i <= checkedRow.length; i++) {
                var dataIdChecked = $(checkedRow[i]).data('id');


                // cycle in array of current users to check if the item is new or exist
                for (var secCount = 0; secCount <= config.curUsers.length; secCount++) {
                    var dataIdInArr = $(config.curUsers[secCount]).data('id');
                    if (dataIdChecked == dataIdInArr) {
                        existInArr = true;
                        break
                    }
                };
                if (!existInArr) {
                    config.curUsers.push(checkedRow[i]);
                }
            };
            view.drawUserFromArr();
        };
        this.removeUserfromArray = function (elem) {
            var dataIdRemoved = $(elem).data('id');
            for (var i = 0; i <= config.curUsers.length; i++) {
                var dataIdInArr = $(config.curUsers[i]).data('id');
                if (dataIdInArr == dataIdRemoved) {
                    config.curUsers.splice(i, 1);
                };
            };
            for (var i = 0; i < config.amount.length; i++) {
                config.amount[i].checkBtn();
            };
            view.changeUserCount();
        };
    };
    this.View = function (model) {
        var view = this;
        this.errorRemove = function () {
            $('#unoc-create-users .unoc__users-msg--error').remove();
            $('#display-error').find('.unoc__users-error.alert').remove();
        };
        this.initWizard = function () {
            $(config.form.formSelector).quickWizard({
                'prevButton': '<button id="form-wizard-prev" class="btn btn-default pull-left wizard__btn wizard__prev" disabled="disabled" type="button">' + resources.Shared_Prev + '</button>',
                'nextButton': '<button id="form-wizard-next" class="btn btn-default pull-right wizard__btn wizard__next btn-primary" type="button">' + resources.Shared_Next + '</button>',
                'element': 'section',
                'breadCrumbElement': 'h3',
                'clickableBreadCrumbs': true,
                'stepByStep': false
            });
        };


        this.initDbSelect = function (selectObj) {
            selectObj.chosen({ disable_search_threshold: 10, width: '260px' }).change(function () {
                model.getCurrentModel();
                view.Calculate();
            });
        };

        this.addDbSelect = function () {
            var conf = config.dbs,
                elemToClone = $(conf.dbsBlockSelector + ' ' + conf.dbsItemSelector).eq(0),
                isEmptySelects = false;

            $(conf.dbsBlockSelector + ' ' + conf.dbsSelectSelector).each(function () {
                if ($(this).val() === '') {
                    isEmptySelects = true;
                }
            });

            if (isEmptySelects) {
                errorMessageAdd($(conf.dbsListSelector), resources.ErrorAddDb);
            } else {
                var newDbElem = elemToClone.clone();
                var updateId = $(conf.dbsBlockSelector + ' ' + conf.dbsItemSelector).length;

                newDbElem.find('.chosen-container').remove();
                newDbElem.find('#autoUpdate').attr('id', 'autoUpdate-' + updateId);
                newDbElem.find('label[for="autoUpdate"]').attr('for', 'autoUpdate-' + updateId);
                newDbElem.find('.unoc__dbs-name-input').val('');

                newDbElem.find(conf.dbsDeleteSelector).append($('<a />', {
                    class: 'btn-delete unoc-user-delete',
                    'title': resources.Delete,
                    'href': '#',
                    click: function (e) {
                        e.preventDefault();
                        newDbElem.remove();
                        model.getCurrentModel();
                        $('#unoc-create-users .unoc__users-msg--error').remove();
                        view.Calculate();
                    }
                }));
                $(conf.dbsListSelector).append(newDbElem);
                view.initDbSelect(newDbElem.find(conf.dbsSelectSelector));
            }
        }

        this.manageUserCount = function () {
            var conf = config.users,
                props = view.getAddUsersProps();

            if (!props.isAbleToAddUser) {
                errorMessageAdd($(conf.userListSelector), resources.ErrorAddUser);
            } else {
                $(conf.userModalSelector).modal('show');
            }
        };

        this.changeUserCount = function () {
            view.checkAutogenerateVisibility();
            model.getCurrentModel();
            view.Calculate();
        };

        this.addUserRow = function () {
            var conf = config.users,
                form = $(conf.userModalFormSelector);

            var tpl = document.getElementById('template-unoc-user'),
                tplContainer = 'content' in tpl ? tpl.content : tpl,
                newItem = tplContainer.querySelector(conf.userItemSelector).cloneNode(true),
                newItemId = Math.ceil(Math.random() * 1000);


            var name = form.find('#unoc-modal-userfirstname').val();
            email = form.find('#unoc-modal-useremail').val();

            $(newItem).find(conf.userFirstnameSelector).text(name);
            $(newItem).find(conf.userEmailSelector).text(email);
            $(newItem).find(conf.userAccessSelector).attr('id', 'user-' + newItemId);
            $(newItem).find(conf.userAccessLabelSelector).attr('for', 'user-' + newItemId);
            $(newItem).attr('data-id', newItemId);

            $(newItem).find('.unoc-user-delete').click(function (e) {
                e.preventDefault();
                $(newItem).remove();
                view.changeUserCount();
                view.errorRemove();

                if (Number($(config.users.userAccessSelector + ':checked').length) == 0) {
                    $('#users-choosen-table').toggleClass('hidden');
                }
            });
            $(newItem).find(conf.userAccessSelector).change(function () {
                if (!$(this).prop('checked')) {
                    $(newItem).remove();
                    view.changeUserCount();
                }
            });

            $(conf.userNoOneSelector).addClass('hidden');
            $(conf.userModalSelector).modal('hide');
            $(conf.userModalFormSelector)[0].reset();
            model.addUserToArray(newItem);
        };

        this.showActiveUserForm = function (elem) {
            var elemClass = $(elem).attr('class'),
                elemAtr = $(elem).attr('data-unocadd');
            if (!$(elem).hasClass('unoc-addUser__header-txt--active')){
                $('.' + elemClass).removeClass(elemClass + '--active').parent().removeClass('unoc-addUser__header-wrap--active');
                $(elem).addClass(elemClass + '--active').parent().addClass('unoc-addUser__header-wrap--active');
                $(config.users.userAddForm).toggleClass('hidden');
            }
        };

        this.drawUserFromArr = function () {
            $(config.users.userListTable).removeClass('hidden');
            $(config.users.userListTable + ' ' + config.users.userItemSelector).remove();

            for (var i = 0; i < config.curUsers.length; i++) {
                var cloneItem = $(config.curUsers[i]).clone();
                var curId = $(config.curUsers[i]).attr('id');
                cloneItem.find('.unoc__users-access-input').attr('id', curId + '--' + i);
                cloneItem.find('.unoc__users-access-label').attr('for', curId + '--' + i);

                var lastDiv = $(cloneItem).find('div:last-child');
                if (!lastDiv.hasClass('unoc__users-delete')) {
                    var closeLink = $('<a />', {
                        class: 'btn-delete unoc-user-delete',
                        title: 'close'
                    });
                    lastDiv.addClass('unoc__users-delete').append(closeLink);
                };
                $(config.users.userListTable).append(cloneItem);
            }
            $('.unoc-user-delete').click(function (e) {
                e.preventDefault();
                $(this).parents('.unoc__users-item').remove();
                model.removeUserfromArray($(this).parents('.unoc__users-item'));
                view.changeUserCount();
                view.uncheckInp($(this).parents('.unoc__users-item').data('id'));
            });
            view.changeUserCount();
        };

        this.uncheckInp = function (id) {
            var conf = config.users;
            var checkedElem = $(conf.userBlockSelector).find('.unoc__users-item[data-id="' + id + '"]');
            $(checkedElem).find(conf.userAccessSelector).prop('checked', false);
        };

        this.checkAutogenerateVisibility = function () {
            var props = view.getAddUsersProps();

            if (props.isCheckedItemsMoreInput) {
                $(config.calculator.calcUsersSelector).val(props.checkedItemsCount);
                $(config.users.userAutoGenerateBlockSelector).addClass('hidden');
                $(config.users.userAutoGenerateInputSelector).prop('checked', false);
            } else {
                $(config.users.userAutoGenerateBlockSelector).removeClass('hidden');
                $('#autogenerate-users-count-rest').text(props.wantedItemsCount - props.checkedItemsCount);
            }
        };

        this.getAddUsersProps = function () {
            var conf = config.users,
                wantedItemsCount = Number($(config.calculator.calcUsersSelector).val()),
                checkedItemsCount = $('#users-choosen-table ' + conf.userAccessSelector + ':checked').length,
                result = {};

            result.isCheckedItemsMoreInput = wantedItemsCount <= checkedItemsCount;
            result.wantedItemsCount = wantedItemsCount;
            result.checkedItemsCount = checkedItemsCount;
            result.isAbleToAddUser = checkedItemsCount < Number($(config.calculator.calcUsersSelector).attr('max'));
            return result;
        };

        this.Calculate = function () {
            var sumConf = config.summary,
                calcConf = config.calculator,
                dbConf = config.dbs;

            var usersCount = Number($(calcConf.calcUsersSelector).val()),
                diskCount = Number($(calcConf.calcDiskSelector).val()),
                dbsCount = 0,
                price = 0;

            price += (calc.Tariff.PricePerOne + (usersCount - 1) * calc.Tariff.PricePerOthers);
            price += ((diskCount - calc.DiskConfig.DiskSpaceForFree) * calc.DiskConfig.TariffDisk);

            $(config.dbs.dbsBlockSelector + ' ' + config.dbs.dbsSelectSelector).each(function () {
                if ($(this).val() !== '') {
                    dbsCount++;
                    price += (usersCount * getPricePerDb(Number($(this).val())));
                }
            });

            $(sumConf.sumUsersSelector).text(usersCount);
            $(sumConf.sumDiskSelector).text(diskCount);
            $(sumConf.sumDbsSelector).text(dbsCount);
            $(sumConf.sumPriceSelector).text(price);


            function getPricePerDb(confId) {
                var tariff = calc.Tariff.Configurations.filter(function (el) {
                    return el.Id === confId;
                });
                return tariff[0].PricePerUser;
            }
        };

        this.validateForm = function () {
            var validated = true;
            model.getCurrentModel();
            if (model.Order.CompanyName == '') {
                errorMessageAdd($(config.form.formCompanyName), resources.Required);
                validated = false;
            }

            function checkDbNames() {
                var dbNameArr = [];

                model.Order.UnocConfigurations.forEach(function (el) {
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
                };
                if (hasDuplicates(dbNameArr)) {
                    errorMessageAdd($(config.dbs.dbsListSelector), resources.ErrorSameDbName);
                    validated = false;
                };
            };
            checkDbNames();

            if (model.Order.UnocConfigurations.length === 0) {
                errorMessageAdd($(config.dbs.dbsListSelector), resources.ErrorNoDb);
                validated = false;
            };
            

            if (!model.Order.IsAutoGenerateUsers) {
                if (model.Order.UnocUsers.length === 0) {
                  errorMessageAdd($(config.users.userListSelector), resources.ErrorNoUser);
                  validated = false;
                };
            };

            if (!$(config.users.userAutoGenerateInputConfirmSelector).prop('checked')) {
                errorMessageAdd($(config.users.userAutoGenerateInputConfirmSelector), resources.ErrorAutoGenerateConfirm);
                validated = false;
            };

            return validated;
        };

        this.init = function () {
            view.Calculate();
            view.initWizard();
        };

        this.checkUsersTable = function (row) {
            for (var i = 0; i < row.length; i++) {
                if (!$(row[i]).hasClass(config.users.userNewItem)) {
                    $(row[i]).find('.unoc__users-firstname-txt').attr('name', config.prefix + '[' + i + '].FirstName');
                    $(row[i]).find('.unoc__users-email-txt').attr('name', config.prefix + '[' + i + '].Email');
                } else {
                    if ($(row[i]).find('.unoc__users-input-wrap input').length == 0) {
                        this.transformUserRow(row[i], i);
                    };
                };
            };
        };
        this.transformUserRow = function (elem, index) {
            var inputArr = $(elem).children('.unoc__users-input-wrap');
            var inputVal, inputData, inputHTML;
            for (var i = 0; i < inputArr.length; i++) {
                inputVal = $(inputArr[i]).children().text();
                inputData = $(inputArr[i]).children().data('inputgroup');
                inputHTML = '<input type="text" class="' + inputData + '" value="' + inputVal + '" name="' + config.prefix + '[' + index + ']' + '.' + inputData + '">';
                $(inputArr[i]).children().html(inputHTML);
            };
        };
    };
    this.Controller = function (model, view) {
        var controller = this;
        var errorInterval;

        this.init = function () {
            var dbs = config.dbs,
                users = config.users,
                form = config.form;

            $('.amount').each(function () {
                var amount = new Amount(this, view.changeUserCount, view.changeUserCount);
                config.amount.push(amount);
            });

            view.initDbSelect($(dbs.dbsSelectSelector));
            view.checkAutogenerateVisibility();

            $(dbs.dbsAddSelector).click(function (e) {
                e.stopPropagation();
                view.addDbSelect();
            });

            $(users.userAccessSelector).change(function (e) {
                e.stopPropagation();
                if (!$(this).prop('checked')) {
                    model.removeUserfromArray($(this).parents(users.userItemSelector));
                }
            });

            $(users.userAddToArrayBtn).click(function (e) {
                $(users.userModalSelector).modal('hide');
                model.addUserToArray($(this).parents(users.userAddForm));
            });


            $(form.switchFormLink).click(function (e) {
                view.showActiveUserForm(this);
            })

            $(users.userAutoGenerateInputSelector).change(function (e) {
                e.stopPropagation();
                view.changeUserCount();
                errorMessageRemove($(users.userListSelector));
            });

            $(users.userAddSelector).click(function (e) {
                e.stopPropagation();
                view.manageUserCount();
            });

            $(users.userModalFormSelector).submit(function (e) {
                e.preventDefault();
                view.addUserRow();
            });

            $(form.formSelector).submit(function (e) {
                e.preventDefault();
                if (view.validateForm()) {
                    view.checkUsersTable($(users.userListTable + ' ' + users.userItemSelector));
                    $(errorSummarySelector).remove();
                    sendAjaxRequest(form.formSelector, $(form.formSelector).attr('action'), model.Order, null, null);
                } else {
                    var showNotice = new PanelNotice(resources.ErrorAll, 'danger');
                    errorInterval = setInterval(function () {
                        if ($(errorSelector).length === 0) {
                            $(errorSummarySelector).remove();
                            clearInterval(errorInterval);
                        }
                    }, 1000);
                }
            });
        };
    };
    this.init = function () {
        model = new unoc.Model();
        model.init();
        view = new unoc.View(model);
        view.init();
        controller = new unoc.Controller(model, view);
        controller.init();
    }
};


$(function () {
    var companyCreate = new UnocCreate();
    companyCreate.init();
});

