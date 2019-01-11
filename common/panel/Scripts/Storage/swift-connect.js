var Swift = function (options, cbTokenReceivedFirst, cbTokenFailed) {
  var swiftObj = this;
  var token = 0;
  var forgery = document.querySelector('[name="__RequestVerificationToken"]').value;
  var c = { // config
    tokenUrl: options.tokenUrl,
    account: '/v1/AUTH_' + options.model.ExternalId,
    storageHost: options.model.Owner.SwiftApiConnection.Endpoint.replace(':443/', '')
  };

  getAuthToken(true, cbTokenReceivedFirst, cbTokenFailed);

  /* OPTIONS */
  this.formatPostfix = '?format=json'; // must be always first param after path
  this.delimPostfix = '&delimiter=%2F';

  /* ACCOUNT */
  this.getListAccount = function (successHandler) {
    send('GET', swiftObj.formatPostfix, null, successHandler);
  };

  /* CONTAINERS */
  /*
   * Gets list of objects in concrete container due to path provided. You can get all objects, indexed with provided path (isNoDelimiter = true) or only "first-leveled" (default)
   * @string containerName - container, from which we want to get list of objects
   * @string path - part of objects' name according to which swift will filter results
   * @function? successHandler - success callback after getting objects
   * @bool isNoDelimiter - get all objects suited for the path or get objects in this "folder" only
   */
  this.getListContainers = function (containerName, path, successHandler, errorHandler, isNoDelimiter) {
    let prefix = (path) ? '&prefix=' + encodeURIComponent(path) + '&marker=' + encodeURIComponent(path) : '';
    let cbSuccess = (typeof successHandler !== 'undefined') ? successHandler : null;
    let cbError = (typeof errorHandler !== 'undefined') ? errorHandler : null;

    send('GET', encodeURIComponent(containerName) + swiftObj.formatPostfix + (isNoDelimiter ? '' : swiftObj.delimPostfix) + prefix, null, cbSuccess, cbError);
  }
  this.createContainer = function (containerName, headers, successHandler) {
    send('PUT', encodeURIComponent(containerName) + swiftObj.formatPostfix, null, function (data) {
      swiftObj.setContainerMetadata(containerName, headers, successHandler);
    });
  }
  this.getContainerMetadata = function (containerName, successHandler) {
    send('HEAD', encodeURIComponent(containerName) + swiftObj.formatPostfix, null, successHandler);
  }
  this.deleteContainer = function (containerName, successHandler) {
    send('DELETE', encodeURIComponent(containerName) + swiftObj.formatPostfix, null, successHandler);
  }
  this.setContainerMetadata = function (containerName, headers, successHandler) {
    send('POST', encodeURIComponent(containerName) + swiftObj.formatPostfix, null, successHandler, null, headers);
  }

  /* BULK OPERATIONS */
  /*
   * Deletes list of objects in one request
   * @array deleteArr - array of items to delete in "CONTAINER_NAME/PATH_TO_OBJECT" format (names must be utf-8 encoded)
   * @function successHandler - callback after successfull deletion
  */
  this.bulkDeleteObjects = function (deleteArr, successHandler) {
    send('POST', swiftObj.formatPostfix + '&bulk-delete=true', deleteArr.join('\r\n'), bulkDeleteSuccess, null, {
      'Content-Type': 'text/plain'
    });

    function bulkDeleteSuccess(data) {
      let message = getDeleteMessage(data);
      let notice = new PanelNotice(message.html, message.type);

      if (typeof successHandler === 'function') {
        successHandler(data);
      }
    }
    function getDeleteMessage(data) {
      let messageHtml = [];
      let type = 'success';

      if (data['Response Status'] === '200 OK') {
        messageHtml.push('Все объекты (' + data['Number Deleted'] + ') были успешно удалены');
      } else {
        if (data['Response Body'] !== '') {
          messageHtml.push(data['Response Body']);
        }

        if (data['Errors'].length > 0) {
          type = 'warning';
          data['Errors'].forEach(function (error) {
            errorText = (error[1] === '409 Conflict') ? resources.Storage_Container_Delete_Warning : error[1];
            messageHtml.push('<strong>' + decodeURIComponent(error[0]) + '</strong> - ' + errorText);
          });
        }
      }

      return {
        html: messageHtml.join('<br/><br/>'),
        type: type
      };
    }
  };

  /* OBJECTS */

  this.createObject = function (containerName, objectName, objectType, successHandler) {
    send('PUT', encodeURIComponent(containerName) + '/' + encodeURIComponent(objectName) + swiftObj.formatPostfix, null, successHandler, null, {
      'Content-Type': objectType
    });
  };
  this.uploadObject = function (file, xhr) {
    let contentType = file.type || cloudMimeTypes.lookup(file.name);

    xhr.setRequestHeader('Content-Type', contentType);
    xhr.send(file);
  };
  this.deleteObject = function (containerName, objectName, successHandler) {
    send('DELETE', encodeURIComponent(containerName) + '/' + encodeURIComponent(objectName) + swiftObj.formatPostfix, null, successHandler);
  };
  this.copyObject = function (containerFromName, pathFrom, containerToName, pathTo, obj, successHandler) {
    let copyFrom = encodeURIComponent(containerFromName) + '/' + encodeURIComponent(pathFrom + obj.filename);

    send('PUT', encodeURIComponent(containerToName) + '/' + encodeURIComponent(pathTo + obj.filename) + swiftObj.formatPostfix, null, successHandler, null, {
      'X-Copy-From': copyFrom,
      'Content-Type': obj.content_type
    });
  };
  this.renameObject = function (container, path, obj, newName, successHandler) {
    let copyFrom = encodeURIComponent(container) + '/' + encodeURIComponent(path + obj.filename);

    send('PUT', encodeURIComponent(container) + '/' + encodeURIComponent(path + newName) + swiftObj.formatPostfix, null, function () {
      swiftObj.deleteObject(container, path + obj.filename, successHandler);
    }, null, {
      'X-Copy-From': copyFrom,
      'Content-Type': obj.content_type
    });
  };
  this.moveObject = function (containerFromName, pathFrom, containerToName, pathTo, obj, successHandler) {
    swiftObj.copyObject(containerFromName, pathFrom, containerToName, pathTo, obj, function () {
      swiftObj.deleteObject(containerFromName, pathFrom + obj.filename, successHandler);
    });
  }
  this.getLinkToObject = function (containerName, objectName) {
    return c.storageHost + c.account + '/' + encodeURIComponent(containerName) + '/' + encodeURIComponent(objectName);
  };

  this.createSimpleRequest = function (method, url) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, c.storageHost + c.account + '/' + url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    xhr.setRequestHeader('X-Auth-Token', token.Value);

    return xhr;
  };

  function send(method, url, data, cbSuccess, cbError, headers) {
    if (token === 0) {
      throw 'Нет токена!';
    }

    var xhr, body, result;
    var errorHandler = (typeof cbError === 'function') ? cbError : function (data) {
      document.querySelector('#swift-table').classList.remove('loading', 'loading--full');
      handleAjaxErrors({ status: 500});
      console.log(data);
    };

    xhr = swiftObj.createSimpleRequest(method, url);

    if (!(typeof headers !== 'undefined' && typeof headers['Content-Type'] !== 'undefined')) {
      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    }

    if (typeof headers !== 'undefined' && headers !== null && typeof headers === 'object' && Object.keys(headers).length > 0) {
      for (var headerKey in headers) {
        xhr.setRequestHeader(headerKey, headers[headerKey]);
      }
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        switch (xhr.status) {
          case 100:
          case 200:
          case 201:
          case 202:
          case 203:
          case 204:
          case 205:
            result = undefined;
            if (xhr.responseText !== undefined && xhr.responseText !== '') {
              result = JSON.parse(xhr.responseText);
            }
            if (method === 'HEAD') {
              result = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
            }
            if (typeof cbSuccess === 'function') {
              cbSuccess(result);
            }
            break;

          case 400:
          case 401:
          case 403:
          case 404:
            errorHandler(xhr);
            break;
          default:
            errorHandler(xhr.status + " Error");
        }
      }
    };

    if (data) {
      xhr.send(data);
    } else {
      xhr.send();
    }
  };

  /*
   * Gets auth token from 1cloud panel' backend. If it is first initialization, then, after receiving token, we will send request to Swift to get list of containers
   * @bool isFirst - is it first time to get auth token
   */
  function getAuthToken(isFirst, cbSuccess, cbFail) {
    var xhr = new XMLHttpRequest();

    xhr.open('POST', c.tokenUrl, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader("X-PID", user.projectId);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        switch (xhr.status) {
          case 200:
            if (xhr.responseText !== undefined && xhr.responseText !== '') {
              token = JSON.parse(xhr.responseText);
              setTokenRefresh(token.ExpiresAt);
            }
            if (isFirst && typeof cbSuccess === 'function') {
              cbSuccess();
            }
            break;

          case 500:
          case 401:
          case 404:
          case 403:
            if (typeof cbFail === 'function') {
              cbFail(xhr);
            }
            break;

          default:
            console.log(xhr.status + " " + xhr.statusText);
        }
      }
    };

    xhr.send("__RequestVerificationToken=" + forgery);
  };

  function setTokenRefresh(dateExpired) {
    let numberPattern = /\d+/g;
    let now = Date.now();
    let expire = Number(dateExpired.match(numberPattern)[0]);
    let refreshTimeout = expire - now - 15000; // 15 seconds before token expires

    setTimeout(getAuthToken, refreshTimeout);
  }
};


