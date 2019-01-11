var Filter = function (fFormId, fSubmitFunc) {
  var filter = this;
  this.config = {
    filterForm: document.getElementById(fFormId),
    initValues: {}
  };

  /*
   * Sets select's value due to transferred text
   * @string selectName - name of a select, where to find text
   * @string text - text to find
   */
  this.setSelectValueFromOptionText = function (selectName, text) {
    var select = this.config.filterForm.elements[selectName],
      options = select.querySelectorAll('option');

    for (var i = 0; i < options.length; i++) {
      if (options[i].textContent === text) {
        select.value = options[i].value;
        return;
      }
    }
  };

  /*
  * Returns an object from all filter fields besides button
  */
  this.getFilterObj = function () {
    var form = this.config.filterForm,
      elements = form.elements,
      formFields = getFormValues();
    
    if (this.config.limit) {
      formFields['Limit'] = this.config.limit;
    }

    return formFields;
  };

  /*
   * Sets new url, according to chosen filter params
   */
  this.setNewUrl = function () {
    var form = this.config.filterForm,
      elements = form.elements,
      newUrlSearch = '?',
      newUrlObj = {};

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.getAttribute('type') !== 'submit') {
        if (el.getAttribute('type') !== 'checkbox') {
          if (el.value !== '') {
            newUrlObj[el.getAttribute('name')] = el.value;
          }
        } else {
          newUrlObj[el.getAttribute('name')] = el.checked;
        }
      }
    }

    if (history.pushState) {
      var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

      if (Object.keys(newUrlObj).length > 0) {
        Object.keys(newUrlObj).forEach(function (el, i) {
          if (i !== 0) {
            newUrlSearch += '&';
          }
          newUrlSearch += (el + '=' + newUrlObj[el]);
        });

        newUrl += newUrlSearch;
      }
      
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  /*
  * Initiates filter pagination limit activity
  */
  this.initFilterPagination = function () {
    var limitBtns = document.querySelectorAll('.pagination a');
    var limitLis = document.querySelectorAll('.pagination li');
    var filter = this;

    if (limitBtns.length > 0) {
      var activePageBtn = (document.querySelector('.pagination .active a').length > 0) ? document.querySelector('.pagination .active a') : document.querySelector('.pagination li:first-of-type a');
      filter.config.limit = activePageBtn.dataset.limit;

      for (var i = 0; i < limitBtns.length; i++) {
        limitBtns[i].addEventListener('click', function (e) {
          e.preventDefault();
          var btn = e.target;
          filter.config.limit = btn.dataset.limit;

          for (var j = 0; j < limitLis.length; j++) {
            limitLis[j].classList.remove('active');
          }
          btn.parentNode.classList.add('active');

          fSubmitFunc();
        }, false);
      }
    }
  }

  /*
  * Adds control to clear all form fields and submit form
  */
  this.addResetControl = function () {
    var c = this.config,
      form = c.filterForm;

    c.initValues = getFormValues();

    var resetElem = document.createElement('a');
    resetElem.href = '#';
    resetElem.setAttribute('role', 'button');
    resetElem.textContent = textResetFilter;
    
    resetElem.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      filter.resetForm();
      form.querySelector('[type="submit"]').click();
    });

    form.appendChild(resetElem);
  };

  /*
  * Resets form values. (form.reset() works incorrectly: if we have get params in url, form believes that this is default state and sets this value to corresponding field when reseting)
  */
  this.resetForm = function () {
    var form = this.config.filterForm,
      elements = form.elements,
      init = this.config.initValues;

    [].forEach.call(elements, function (el) {
      if (el.name === 'Level' || el.name === 'StateTask' || el.name === 'PartnerId' || el.name === 'Filter.PartnerId') {
        el.value = init[el.name];
        return;
      }
      if (el.name === 'IsHideDeleted') {
        el.checked = true;
        return;
      }
      switch (el.nodeName.toLowerCase) {
        case 'select':
          el.firstChild.selected = true;
          break;
        default:
          el.value = '';
      }
    });
  };

  /*
  * Initiates filter form activity (add Listener for button "Filter")
  */
  this.init = function () {
    var filter = this,
      filterForm = this.config.filterForm;

    filterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      filter.setNewUrl();
      if (typeof fSubmitFunc === 'function') {
        fSubmitFunc();
      } else {
        location.reload();
      }
    });

    this.initFilterPagination();
    this.addResetControl();

    if (history.pushState && typeof window.onpopstate !== 'function') {
      window.onpopstate = function () {
        window.location = document.location;
      }
    }
  }

  function getFormValues() {
    let elements = filter.config.filterForm.elements;
    let result = {};

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.getAttribute('type') !== 'submit') {
        if (el.getAttribute('type') !== 'checkbox') {
          result[el.getAttribute("name")] = el.value;
        } else {
          result[el.getAttribute("name")] = el.checked;
        }
      }
    }

    return result;
  }
}