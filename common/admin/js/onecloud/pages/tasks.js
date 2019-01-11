'use strict';

var Tasks = {
    config: {
        filterFormId: 'tasks-filter',
        tasksContainerId: 'tasks',
        tasksListId: 'tasks-table',
        tasksListUrl: 'list'
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
            Tasks.item.curTask = {};
            Tasks.item.taskBlock.classList.remove('main-list__info--active');
            Tasks.list.load();
        },
        init: function () {
            Tasks.filter.obj = new Filter(Tasks.config.filterFormId, Tasks.filter.submit);
            Tasks.filter.obj.init();
            var config = Tasks.filter.config;
            config.form = document.getElementById(Tasks.config.filterFormId);
            config.canFilterByPartner = config.form.dataset.partnerFilter.toLowerCase();
            config.level = config.form.dataset.level;
        }
    },
    list: {
        /*
         * Loads tasks list due to filter values
         */
        load: function () {
            $.get(Tasks.makeCorrectUrl(Tasks.config.tasksListUrl), Tasks.filter.obj.getFilterObj(), function (data) {
                Tasks.list.drawTasksList(data);
            }).fail(function (data) {
                handleAjaxErrors(data);
                console.log('Error getting tasks');
            });
        },
        /*
         * Draw tasks table due to server's response
         * @obj data - object from server with tasks object list
         */
        drawTasksList: function (data) {

            var container = document.getElementById(Tasks.config.tasksContainerId),
                table = document.getElementById(Tasks.config.tasksListId),
                noResults = container.querySelector('.table--no-results'),
                list = table.querySelector('.tasks__row-list');

            container.parentNode.classList.add('loading', 'loading--full');
            setTimeout(function () {
                while (list.firstChild) {
                    list.removeChild(list.firstChild);
                }
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        list.appendChild(Tasks.list.drawSingleTask(i, data[i]));
                    }
                    table.classList.remove('hidden');
                    noResults.classList.add('hidden');

                    if (data.length === 1) {
                        Tasks.item.load(data[0].ID);
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
        drawSingleTask: function (index, task) {
            var tpl = document.getElementById('task-row-template'),
                taskCreated = new Date(task.DateCreate),
                tplContainer = 'content' in tpl ? tpl.content : tpl,
                elem = tplContainer.querySelector('tr').cloneNode(true);
            elem.dataset.id = task.ID;
            
            elem.querySelector('.status-label').classList.add('status', 'status--' + task.StateId);
            elem.querySelector('.tasks__row-date').textContent = window.util.formatDate(taskCreated);
            window.util.fillDetalization('', task, elem);

            


            

            elem.addEventListener('click', function () {
                if (task.ID !== Tasks.item.curTask.ID) {
                    var rows = document.querySelectorAll('.tasks__row');
                    for (var i = 0; i < rows.length; i++) {
                        rows[i].classList.remove('active');
                    }
                    this.classList.add('active');
                    Tasks.item.load(task.ID);
                }
            });

            if (task.ID === Tasks.item.curTask.ID) {
                elem.classList.add('active');
            };
            return elem;
        }
    },
    item: {
        config: {
            fields: {
                ClientEmail: document.getElementById('customer-email'),
                TaskId: document.getElementById('task-ID'),
                taskProgress: document.getElementById('task-ProgressPercent'),
                StateId: document.getElementById('task-StateId'),
                dateCreated: document.getElementById('task-date'),
                dateModified: document.getElementById('task-date-modify'),
                TypeId: document.getElementById('task-TypeId'),
                ServiceInstanceId: document.getElementById('task-ServiceInstanceID'),
                ServiceInstanceIP: document.getElementById('task-ServiceInstanceIP'),
                taskText: document.getElementById('task-text'),
                ErrorMessage: document.getElementById('ErrorMessage')
            },
            actions: {
                restart: {
                    url: '/restart',
                    elem: document.getElementById('restart-btn'),
                    modal: {
                        title: 'Перезапустить задачу',
                        introtext: '(Действие приводит к перезапуску данной задачи. При этом необходимо обратить внимание, что не все задачи возможно перезапустить)',
                        hiddenComment: false,
                        btnText: 'Перезапустить'
                    }
                },
                'delete': {
                    url: '/delete',
                    elem: document.getElementById('delete-btn'),
                    modal: {
                        title: 'Удалить задачу',
                        introtext: '(В результате данного действия задача будет удалена)',
                        hiddenComment: false,
                        btnText: 'Удалить'
                    }
                },
                complete: {
                    url: '/complete',
                    elem: document.getElementById('complete-btn'),
                    modal: {
                        title: 'Завершить задачу',
                        introtext: '(Задача будет помечена как "выполненная")',
                        hiddenComment: false,
                        btnText: 'Завершить'
                    }
                },
                hold: {
                    url: '/hold',
                    elem: document.getElementById('hold-btn'),
                    modal: {
                        title: 'Заблокировать задачу',
                        introtext: '(Данное действие приводит к запрету на выполнение действий с данной задачей)',
                        hiddenComment: false,
                        btnText: 'Заблокировать'
                    }
                },
                unhold: {
                    url: '/unhold',
                    elem: document.getElementById('unhold-btn'),
                    modal: {
                        title: 'Разблокировать задачу',
                        introtext: '(В результате данного действия другие пользователи смогут выполнять операции на данной задачей)',
                        hiddenComment: false,
                        btnText: 'Разблокировать'
                    }
                }
            },
            curAction: ''
        },

        interval: false,
        curTask: {},
        taskBlock: document.getElementById('task-info'),
        summaryControl: document.getElementById('task-summary-collapse-btn'),
        filterControl: document.getElementById('collapse-filter-btn'),
        summaryBlock: document.getElementById('task-summary'),
        descriptionBlock: document.getElementById('task-description'),
        holdedAlertElems: document.querySelectorAll('.tasks__header-alert'),
        actionsBlock: document.getElementById('task-actions'),
        actionsBlockModal: document.getElementById('modal-actions'),
        load: function (id) {
            $.get(Tasks.makeCorrectUrl(id), function (data) {
                var item = Tasks.item;
                item.curTask = data;
                item.actionsBlock.classList.remove('main-list__actions--active');
                item.fillCustomerInfo(data);

            }).fail(function (data) {
                console.log('Error loading task');
                handleAjaxErrors(data);
            });
        },
        fillCustomerInfo: function (taskInfo) {
            var taskBlock = Tasks.item.taskBlock,
                taskCreated = new Date(taskInfo.DateCreate),
                taskModified = new Date(taskInfo.DateModify),
                taskFields = Tasks.item.config.fields,
                taskActions = Tasks.item.config.actions;

            taskBlock.classList.remove('main-list__info--active');
            setTimeout(function () {
                // FILL TEXT INFO
                window.util.fillDetalization('task-summary', taskInfo);
                window.util.fillDetalizationLinks('task-summary', taskInfo.Links);
                
                taskFields.dateCreated.textContent = window.util.formatDate(taskCreated);
                taskFields.dateModified.textContent = (taskInfo.DateModify != null) ? window.util.formatDate(taskModified) : 'Нет';

                Tasks.item.hideButtons(taskInfo.IsHold);
                taskBlock.classList.add('main-list__info--active');
            }, 100);
        },
        /*
         * Inits all task buttons behaviour
         */
        initButtons: function () {
            var config = Tasks.item.config,
                controls = config.controls,
                actions = config.actions;

            for (var item in actions) {
                if (actions[item].elem){
                    actions[item].elem.dataset.action = item;
                    actions[item].elem.addEventListener('click', function () {
                      var action = this.dataset.action;
                      Tasks.modal.clear();
                      Tasks.modal.fill(Tasks.item.config.actions[action], action);
                      Tasks.modal.curAction = action;
                      $(Tasks.modal.config.mBlock).modal('show');
                      Tasks.modal.removeErrors();
                    });
                }
            };
        },
        hideButtons: function (isHold) {
            if (isHold) {
                $('.tasks__actions-btn').addClass('hidden');
                $('.tasks__actions-btn[data-action="unlock"]').removeClass('hidden');
            } else {
                $('.tasks__actions-btn').removeClass('hidden');
                $('.tasks__actions-btn[data-action="unlock"]').addClass('hidden');
            }
        }
    },
    modal: {
        curAction: '',
        config: {
            mFormId: 'task-comment-form',
            mForm: document.getElementById('task-comment-form'),
            mBlock: document.getElementById('modal-comment'),
            mInput: document.getElementById('task-inputs-block'),
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
            var mConfig = Tasks.modal.config;
            mConfig.mTitle.textContent = actionObj.modal.title;
            mConfig.mText.textContent = actionObj.modal.introtext;
            mConfig.mSendBtn.textContent = actionObj.modal.btnText;
            mConfig.mForm.action = Tasks.makeCorrectUrl(Tasks.item.curTask.TaskId + actionObj.url);

            if (actionObj.addInput) {
                mConfig.mInput.innerHTML = actionObj.addInput;
            };

            $(mConfig.mForm).unbind('submit').bind('submit', function (event) {
                event.preventDefault();
                Tasks.modal.removeErrors();
                Tasks.modal.submit(Tasks.item.curTask.TaskId, this, actionName);
            });
        },
        submit: function (task, form, action) {
            sendPostRequest('#' + form.id, form.action, {taskId : task}, function () {
                Tasks.modal.onSuccess();
                if (action == 'unhold') {
                    Tasks.item.hideButtons(false);
                } else if (action == 'hold') {
                    Tasks.item.hideButtons(true);
                };
            }, Tasks.modal.onFail);
        },
        clear: function () {
            var mConfig = Tasks.modal.config;
            mConfig.mInput.innerHTML = '';
            Tasks.item.config.curAction = '';
            Tasks.modal.curAction = '';
        },
        onSuccess: function (data) {
            successPopup('success-pop-up', 'task-summary', true);
            $(Tasks.modal.config.mBlock).modal('hide');
            Tasks.list.load();
            Tasks.modal.clear();
        },
        onFail: function (data) {
            handleAjaxErrors(data, '#' + Tasks.modal.config.mFormId);
            Tasks.modal.addErrorClass();
        },
        removeErrors: function () {
            var errParentBlock = document.getElementById(Tasks.modal.config.mFormId);
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
Tasks.init();