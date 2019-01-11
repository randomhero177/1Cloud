'use strict';

/*
** Base html, required for that module: .guide>.guide__container>.guide__item*2>(.guide__item-header+.guide__item-content)
*/


var Guide = function (options) {
  this.options = {
    startItem: 0,
    arrows: 'default', // 'default', 'only-forward', 'only-backward', 'none'
    altNextClass: '',
    altNextClassSelected: 'selected',
    altNextFunction: '',
    altNextEqualHeights: false,
    result: false,
    resultContainerClass: '',
    resultFunction: ''
  };

  var guide = this;
  var guideContainer = document.querySelector('.guide__container'),
    guideItems = guideContainer.querySelectorAll('.guide__item'),
    guideActiveClass = 'guide__item--active';

  var elemsTotal = guideItems.length,
    elemsCurrent = this.options.startItem;

  this.init = function () {
    this.getOptions(options);
    if (this.options.arrows !== 'none') {
      for (var i = 0; i < elemsTotal; i++) {
        this.appendControls(i, guideItems[i]);
      }
    }

    if (this.options.altNextClass !== '') {
      var altControls = document.querySelectorAll(this.options.altNextClass);
      for (var j = 0; j < altControls.length; j++) {
        altControls[j].addEventListener('click', function () {
          guide.clickAltNextControl(this);
        });
      }
    }

    this.showItem(this.options.startItem);
  };

  /*
  ** Rewrite function options
  ** @object options - object with new properties
  */
  this.getOptions = function (options) {
    if (options) {
      var optionsArr = Object.keys(options);
      for (var i = 0; i < optionsArr.length; i++) {
        this.options[optionsArr[i]] = options[optionsArr[i]];
      }
    }
  };

  /*
  ** Returns control element for guide slide
  ** @string dir - 'prev' or 'next'
  */
  this.createControl = function (dir) {
    var control = document.createElement('span');
    control.classList.add('guide__control', 'oc-icon-arrow', 'guide__control--' + dir, 'oc-arrows__' + ((dir === 'prev') ? 'left' : 'right'));
    control.addEventListener('click', function () {
      guide.clickControl(this);
    });
    return control;
  };

  /*
  ** Appends controls for guide elements
  ** @object item -  guide element
  */
  this.appendControls = function (index, item) {
    var header = item.querySelector('.guide__item-header');
    header.classList.add('guide__item-header--with-controls');
    switch (index) {
      case 0:
        if (this.options.arrows !== 'only-backward') {
          header.appendChild(this.createControl('next'));
        }
        break;
      case elemsTotal - 1:
        if (this.options.arrows !== 'only-forward') {
          header.appendChild(this.createControl('prev'));
        }
        break;
      default:
        if (this.options.arrows !== 'only-forward') {
          header.appendChild(this.createControl('prev'));
        }
        if (this.options.arrows !== 'only-backward') {
          header.appendChild(this.createControl('next'));
        }
    }
  };

  /*
  ** Check controls click
  ** @object control - control, that has been clicked
  */
  this.clickControl = function (control) {
    if (control.classList.contains('guide__control--prev')) {
      this.prev();
    } else {
      this.next();
    }
  };

  /*
  ** Marks selected elem, switches to next item (if last item, launches result function)
  ** @object elem - custom next element that has been clicked
  */
  this.clickAltNextControl = function (elem) {
    var elements = guideItems[elemsCurrent].querySelectorAll(guide.options.altNextClass);
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove(guide.options.altNextClassSelected);
    }
    elem.classList.add(guide.options.altNextClassSelected);

    if (typeof guide.options.altNextFunction === 'function') {
      guide.options.altNextFunction(elem);
    }

    setTimeout(function () {
      if ((elemsCurrent === elemsTotal - 1) && guide.options.result) {
        guide.showResult();
      } else {
        guide.next();
      }
    }, 150);
  };

  /*
  ** Shows the guide item with concrete index
  ** @number index
  */
  this.showItem = function (index) {
    for (var i = 0; i < elemsTotal; i++) {
      guideItems[i].classList.remove(guideActiveClass);
    }
    guideItems[index].classList.add(guideActiveClass);

    if (this.options.altNextEqualHeights && this.options.altNextClass !== '') {
      this.setAltControlsEqualHeight(guideItems[index]);
    }
  };

  /*
  ** Executes result function (if specified) and then hides guide last active block and shows result block (also if specified)
  */
  this.showResult = function () {
    var resultBlock;
    if (typeof guide.options.resultFunction === 'function') {
      guide.options.resultFunction();
    }
    if (guide.options.resultContainerClass !== '') {
      resultBlock = document.querySelector(guide.options.resultContainerClass);
      if (resultBlock) {
        guideItems[elemsCurrent].classList.remove(guideActiveClass);
        resultBlock.classList.add(guideActiveClass);
      }
    }
  };

  this.next = function () {
    if (elemsCurrent + 1 <= elemsTotal - 1) {
      this.showItem(elemsCurrent + 1);
      elemsCurrent++;
    }
  };
  this.prev = function () {
    if (elemsCurrent - 1 >= 0) {
      this.showItem(elemsCurrent - 1);
      elemsCurrent--;
    }
  };
  this.restart = function () {
      elemsCurrent = this.options.startItem;
      guideItems[elemsCurrent].classList.add(guideActiveClass);
      for (var i = 0; i < elemsTotal; i++) {
          if (i !== elemsCurrent) {
              guideItems[i].classList.remove(guideActiveClass);
          }
      }
      if (guide.options.result && guide.options.resultContainerClass !== '') {
          document.querySelector(guide.options.resultContainerClass).classList.remove(guideActiveClass);
      }
  }

  /*
  ** Sets equal heights to custom next controls in current guide block
  ** @object obj - current guide block
  */
  this.setAltControlsEqualHeight = function (obj) {
    var chooseBlocks = obj.querySelectorAll(this.options.altNextClass);
    if (chooseBlocks) {
      var height = 0;

      for (var i = 0; i < chooseBlocks.length; i++) {
        if (chooseBlocks[i].clientHeight > height) {
            height = chooseBlocks[i].clientHeight;
        }
      }
      if (height) {
        for (var j = 0; j < chooseBlocks.length; j++) {
          chooseBlocks[j].style.height = height + 'px';
        }
      }
    }
  };
};
