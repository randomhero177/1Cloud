/*
 * variables companyId,  calc, prevOrder are defined in Edit view
 */

var userActions = {
  config: {
    blockId: '#unoc-company-users',
    userSendEmail: '.unoc__users-sendemail',
    userHasEmail: 'unoc__users-email-attached',
    userRemove: '.unoc__users-access-icon--delete',
    userActionRow: '.unoc__users-useraccess',
    userDataFormAction: 'action',
    noEmailText: resources.noEmailText,
    confirmDelete: resources.confirmDelete,
    sentEmailText: resources.sentEmailText,
    needMoreUsers: resources.needMoreUsers,
    emailWasSent: resources.emailWasSent,
    addUserBlockId: '#unoc-add-user-modal',
    addUserModal: '#add-unoc-user',
    switchFormLink: '.unoc-addUser__header-txt',
    userAddForm: '.unoc-addUser__form',
    userModalBtnSelector: '#unoc-add-user-modal-btn',
    userModalFormSelector: '#unoc-add-user-modal-form',
    userModalFirstName: '#unoc-modal-userfirstname',
    userModalEmail: '#unoc-modal-useremail',
    userFirstnameSelector: '.unoc__users-firstname',
    userEmailSelector: '.unoc__users-email',
    userNoOneSelector: '.unoc__users-no-one',
    userAccessSelector: '.unoc__users-access-input',
    userModalSelector: '#unoc-add-user-modal',
    userItemSelector: '.unoc__users-item',
    userListTable: '#users-choosen-table',
    unocAnchor: '.unoc-modal-anchor',
    userModalMsg: '#unoc-add-user-modal-error',
    userModalTxt: '#unoc-add-user-modal-txt',
    userAddToArrayBtn: '#unoc-add-existed-user-btn',
    curUsers: [],
    usersArr: [],
    userActionRowId: '#unoc__users-useraccess',
    userActionUrl: {
      downloadRdp: '/1ccompany/{companyName}/getrdpfile?userId={userId}',
      sendRdp: '/1ccompany/{companyName}/emailrdpfile?userId={userId}',
      deleteUser: '/1ccompany/{companyName}/users/{userId}'
    }
  },
  // send request if User has unfinished Tasks
  checkTasks: function (obj, noTaskCb, hasTaskCb) {

    $(obj).each(function (index, element) {
      // Data variable will be changed on object recieved from server side
      if (element['Tasks'].length > 0) {
        if (typeof hasTaskCb === 'function') {
          hasTaskCb(element)
        }
      } else {
        if (typeof noTaskCb === 'function') {
          noTaskCb(element)
        }
      };
    })

    //return userActions.config.hasTasks
  },
  actions: {
    makeUsersArr: function () {
      $(usersModel).each(function (index, element) {
        if (usersModel[index]['Model']['IsAccessGranted']) {
          userActions.config.usersArr.push(element)
        }
      });
      return userActions.config.usersArr
    },
    createActionButtons: function (curActionRow) {
      var conf = userActions.config,
        userId = curActionRow['Model']['Id'],
        companyId = $('#unoc__users-useraccess-' + userId).data('company'),
        urlObj = $.extend({}, userActions.config.userActionUrl),
        actionKeys = Object.keys(urlObj),
        tpl = document.getElementById('template-user-actions');
      if (tpl !== null) {
        var tplContainer = 'content' in tpl ? tpl.content : tpl,
          newItem = tplContainer.querySelector('.user-actions-wrap').cloneNode(true);
      }

      actionKeys.forEach(function (item, index) {
        // 
        urlObj[item] = urlObj[item].replace('{userId}', userId);
        urlObj[item] = urlObj[item].replace('{companyName}', companyId);
      });
      $(newItem).find('.unoc__users-access-icon--download a').attr('href', urlObj['downloadRdp']);
      if (curActionRow['Model']['Email'] !== null) {
        $(newItem).find('.unoc__users-access-icon--emaillink')
          .attr('data-action', urlObj['sendRdp']).click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            var thisElem = $(this);

            let confirm = new ConfirmPopup({
              text: resources.confirmSending,
              cbProceed: function () {
                userActions.actions.sendEmail(thisElem, userId);
              }
            });
          });
      } else {
        $(newItem).find('.unoc__users-access-icon--emaillink').addClass('unoc__users-access-icon--noemail');
        var noEmailEl = $('<span />', {
          'text': userActions.config.noEmailText,
          'class': 'unoc__users-access-icon--noemail-txt'
        })
        $(newItem).find('.unoc__users-access-icon--emaillink').append(noEmailEl);
      };
      
      $(newItem).find('.unoc__users-access-icon--delete').attr('data-action', urlObj['deleteUser']).click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        var thisvar = $(this);

        let confirm = new ConfirmPopup({
          text: resources.confirmDelete,
          cbProceed: function () {
            sendAjaxRequest(userActions.config.blockId, $(thisvar).data(userActions.config.userDataFormAction), userActions.actions.getFormData(thisvar), function () {
              location.reload();
            }, null, 'DELETE');
          }
        });
      });

      $('#unoc__users-useraccess-' + userId).append(newItem);
    },
    createProgressBar: function (curActionRow, newItemElem) {
      var tpl = document.getElementById('template-user-progress');
      if (tpl !== null) {
        var tplContainer = 'content' in tpl ? tpl.content : tpl,
          newItem = tplContainer.querySelector('.unoc__users-progress').cloneNode(true),
          userId = curActionRow['Model']['Id'],
          progressUrl = getTaskProgressUrl.replace('-1', curActionRow['Tasks'][0]['ID']);
        $(newItem).prop('title', curActionRow['Tasks'][0]['Title']);
        if (curActionRow['Tasks'][0]['ProgressPercent'] > 0) {
          $(newItem).find('.bar').css("width", curActionRow['Tasks'][0]['ProgressPercent'] + "%");
        };
        if (typeof newItemElem == 'undefined') {
          $('#unoc__users-useraccess-' + userId).append(newItem);
        } else {
          $(newItemElem).find('#unoc__users-useraccess-' + userId).append(newItem);
        }

        var taskInterval = window.setInterval(function () {
          $.post(progressUrl, null, function (data) {
            if (data.ProgressPercent > 0) {
              $('#unoc__users-useraccess-' + userId + ' .bar').css("width", data.ProgressPercent + "%");
            };
            if (data.TaskIsComplited == true) {
              clearInterval(taskInterval);
              $('#unoc__users-useraccess-' + userId + ' .bar').css("width", "100%");
              setTimeout(function () {
                $('#unoc__users-useraccess-' + userId + ' .unoc__users-progress').remove();
                var actionBtn = new userActions.actions.createActionButtons(curActionRow);

              }, 2000)

            }
          })
            .fail(function (data) {
              clearInterval(taskInterval);
              handleAjaxErrors(data);
            });
        }, 4000)
      }


    },
    getFormData: function (elem) {
      var obj = {};
      obj.companyId = $(elem).parents(userActions.config.userActionRow).data('company');
      obj.userId = $(elem).parents(userActions.config.userActionRow).data('id');
      return obj
    },
    sendEmail: function (elem, userId) {
      var blockId = '#unoc__users-useraccess-' + userId;
      sendAjaxRequest(blockId, $(elem).data(userActions.config.userDataFormAction), userActions.actions.getFormData(elem), function () {
        $(elem).addClass('unoc__users-email-attached--sent');
      }, null)
    },
    goToTab: function (elem) {
      var goTo = $(elem).attr('href');
      $(userActions.config.userModalMsg).modal('hide');
      $('li.ui-state-default.ui-corner-top').find('a[href="' + goTo + '"]').trigger('click');
    },
    modalMsg: function (msg) {
      $(userActions.config.userModalTxt).html(msg);
      $(userActions.config.userModalMsg).modal('show');
      $(userActions.config.unocAnchor).click(function (e) {
        $(userActions.config.userErrorModal).modal('hide');
        e.preventDefault();
        userActions.actions.goToTab(this);
      });
    },
    addUser: {
      checkUsersSpace: function () {
        var isEnoughSpace = true;
        var maxItemsCount = globalConfig.maxUsers,
          curItemsCount = globalConfig.curUsers,
          wantedUsers = $('#unoc-add-user-from-list ' + userActions.config.userAccessSelector + ':checked').length;
        if (parseInt(maxItemsCount) < parseInt(curItemsCount) + wantedUsers) {
          isEnoughSpace = false;
        };
        return isEnoughSpace
      },
      manageUserCount: function () {
        var conf = userActions.config,
          props = userActions.actions.addUser.getAddUsersProps();
        if (!props.isAbleToAddUser) {
          //      errorMessageAdd($(conf.userListSelector), resources.ErrorAddUser);
          userActions.actions.modalMsg(conf.needMoreUsers);

        } else {
          $(conf.addUserBlockId).modal('show');
        }
      },
      getAddUsersProps: function () {
        var maxItemsCount = globalConfig.maxUsers,
          curItemsCount = globalConfig.curUsers;
        var result = {};
        result.isAbleToAddUser = parseInt(maxItemsCount) > parseInt(curItemsCount);
        return result;
      },
      showActiveUserForm: function (elem) {
        var elemClass = $(elem).attr('class'),
          elemAtr = $(elem).attr('data-unocadd');
        if (!$(elem).hasClass('unoc-addUser__header-txt--active')) {
          $('.' + elemClass).removeClass(elemClass + '--active').parent().removeClass('unoc-addUser__header-wrap--active');
          $(elem).addClass(elemClass + '--active').parent().addClass('unoc-addUser__header-wrap--active');
          $(userActions.config.userAddForm).toggleClass('hidden');
        }
      },
      addNewUserRow: function () {
        var conf = userActions.config,
          form = $(conf.userModalFormSelector);

        var tpl = document.getElementById('template-unoc-user'),
          tplContainer = 'content' in tpl ? tpl.content : tpl,
          newItem = tplContainer.querySelector(conf.userItemSelector).cloneNode(true);
        newItemId = Math.ceil(Math.random() * 1000);

        var name = form.find(conf.userModalFirstName).val();
        email = form.find(conf.userModalEmail).val();

        $(newItem).find(conf.userFirstnameSelector).text(name);
        $(newItem).find(conf.userEmailSelector).text(email);
        $(newItem).find(conf.userAccessSelector).attr('id', 'user-' + newItemId);
        $(newItem).find(conf.userAccessLabelSelector).attr('for', 'user-' + newItemId);
        $(newItem).attr('data-id', newItemId);
        $(newItem).find(conf.userFirstnameSelector).attr('name', 'Users[0]');

        $(conf.userNoOneSelector).addClass('hidden');

        var FirstName = $(newItem).find(conf.userFirstnameSelector).text();
        var Email = $(newItem).find(conf.userEmailSelector).text();
        var obj = {};
        obj.Users = [{ 'FirstName': FirstName, 'Email': Email }];

        this.createNewUser(obj, newItem, 1, true);
      },
      addExistUser: function (elem) {
        var config = userActions.config;
        var checkedRow = elem.find(config.userAccessSelector + ':checked').parents(config.userItemSelector);
        var obj = {};
        obj.Users = [];
        for (var i = 0; i < checkedRow.length; i++) {
          var childObj = {};
          var UserId = $(checkedRow[i]).data('id');
          var firstName = $(checkedRow[i]).find(config.userFirstnameSelector).text();
          childObj['UserId'] = UserId;
          childObj['FirstName'] = firstName;
          obj.Users.push(childObj);
        }
        this.createNewUser(obj, checkedRow, obj.Users.length, false);
      },
      drawRow: function (name, login, password, elem, userId, item) {
        var conf = userActions.config,
          tpl = document.getElementById('template-unoc-user'),
          tplContainer = 'content' in tpl ? tpl.content : tpl,
          newItem = tplContainer.querySelector(conf.userItemSelector).cloneNode(true),
          getHref = $(newItem).find(conf.userFirstnameSelector).attr('href');

        $(newItem).find(conf.userFirstnameSelector).text(name).attr('href', getHref.replace('-1', userId));
        $(newItem).attr('id', 'userid-' + userId)
        $(newItem).find(conf.userFirstnameSelector).text(name);
        $(newItem).find(conf.userEmailSelector).text(login);
        $(newItem).find('.unoc__users-password--real').text(password);
        $(newItem).find('.unoc__users-access-actions').attr('id', 'unoc__users-useraccess-' + userId);
        userActions.actions.createProgressBar(item, newItem);
        $(conf.userListTable).append(newItem);
        $(conf.userModalSelector).modal('hide');
      },
      addUserToArray: function (elem) {
        var config = userActions.config;
        config.curUsers.push($(elem));
      },
      createNewUser: function (obj, elem, index, isNew) {
        var config = userActions.config,
          blockId = (isNew) ? '#unoc-add-new-user' : '#unoc-add-user-from-list';
        sendAjaxRequest(blockId, $(config.userListTable).data('actionadduser'), obj, function (data) {
          userActions.actions.addUser.showUserProgress(data, elem);
          if (!isNew) {
            $(elem).each(function () {
              $('#unoc-add-user-from-list').find(this).remove();
            })
          }
        }, function () {
          setTimeout(function () {
            if (elem !== 'undefined') {
              $(elem).remove();

            } else {
              //     location.reload();
            };
          }, 5000)
        }, 'PUT');
      },
      showUserProgress: function (data, elem) {
        data.forEach(function (item, index) {
          var curItem = data[index],
            curTaskId = curItem['Tasks'][0]['ID'],
            fillObj = {
              curName: curItem['Model'].FirstName,
              curLogin: curItem['Model'].Login,
              curPassword: curItem['Model'].Password,
              curId: curItem['Model'].Id,
              url: getTaskProgressUrl.replace('-1', curTaskId)
            };
          userActions.actions.addUser.drawRow(fillObj.curName, fillObj.curLogin, fillObj.curPassword, elem[index], fillObj.curId, item);
        });
        globalConfig.curUsers = parseInt(globalConfig.curUsers) + data.length;
      }
    }
  },
  init: function () {
    var conf = this.config;
    $(conf.addUserModal).click(function () {
      userActions.actions.addUser.manageUserCount();
    });
    $(conf.switchFormLink).click(function () {

      userActions.actions.addUser.showActiveUserForm($(this));
    })
    $(conf.userModalFormSelector).submit(function (e) {
      e.preventDefault();
      userActions.actions.addUser.addNewUserRow();
    });

    $(conf.userAddToArrayBtn).click(function (e) {
      e.preventDefault();
      if (userActions.actions.addUser.checkUsersSpace()) {
        userActions.actions.addUser.addExistUser($(this).parents(conf.userAddForm));
      } else {
        $('#display-error').removeClass('hidden');

        $('.goToTab').click(function () {
          $(conf.userModalSelector).modal('hide');
          userActions.actions.goToTab(this);
        });
        setTimeout(function () {
          $('#display-error').addClass('hidden');
        }, 8000);
      };
      //   
    });
    this.checkTasks(userActions.actions.makeUsersArr(), userActions.actions.createActionButtons, userActions.actions.createProgressBar);

  }
};
userActions.init();