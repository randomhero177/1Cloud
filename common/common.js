/* =============== TEXT VARIABLES =============== */
var arrowTopText = 'Наверх',
  cmdShowText = 'развернуть',
  cmdHideText = 'свернуть',
  testimonialsShowText = 'показать весь отзыв',
  testimonialsHideText = 'свернуть отзыв',
  carouselArrowPrev = '<i class="carousel-arrows carousel-arrows__left"></i>',
  carouselArrowNext = '<i class="carousel-arrows carousel-arrows__right"></i>',
  errorMsgEmptyField = 'Данное поле обязательно для заполнения',
  errorMsgInvalidEmail = 'Поле содержит недопустимый адрес электронной почты',
  errorClass = 'error__message',
  errorElem = $('<span/>', {
    'class': errorClass,
    'text': errorMsgEmptyField
  }),
  errorElemSelector = '.' + errorClass,
  errorSummaryClass = 'error__summary',
  errorSummarySelector = '.' + errorSummaryClass,
  licenseWindows = 'Windows Server Standard Edition';

var curPage = window.location.pathname;

var switchStart,
  switchEnd,
  switchActive;

window.breakpoints = {
  xs: 480,
  sm: 768,
  md: 992,
  lg: 1200
}

/*
 * findInArr - Function to check if element is in specified array
 */
if ([].indexOf) {
  var findInArr = function (array, value) {
    return array.indexOf(value);
  }
} else {
  var findInArr = function (array, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === value) return i;
    }
    return -1;
  }
}

/*
 * Function to check availability of LocalStorage or SessionStorage
 */
function storageAvailable(type) {
  try {
    var storage = window[type],
      a = '__storage_test__';
    storage.setItem(a, a);
    storage.removeItem(a);
    return true;
  }
  catch (e) {
    return false;
  }
}
function handleAuth() {
  var isAuthed = (typeof window.Authenticated !== 'undefined' && window.Authenticated === true);
  var iconLogin = document.querySelector('#header-icon-user');
  var btnLogin = document.querySelector('#header-reg-btn');

  iconLogin.classList[(isAuthed) ? 'add' : 'remove']('header__icon--active');
  iconLogin.setAttribute('title', (isAuthed) ? iconLogin.dataset.titleActive : iconLogin.dataset.title);
  iconLogin.classList.remove('hidden');

  btnLogin.textContent = (isAuthed) ? btnLogin.dataset.titleActive : btnLogin.dataset.title;
  btnLogin.classList.remove('hidden');
}

/* =============== MOBILE VARIABLES =============== */
var isMobile = false,
  isIOs = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)/);

function checkMobile() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
  }
}

/* =============== GO!!!! =============== */
$(function () {
  checkMobile();
  handleAuth();

  $('a[href=""], a[href="#"]').css('cursor', 'default').click(function (e) {
    e.preventDefault();
  });

  /* =============== EQUAL HEIGHTS =============== */
  equalHeights($('.services__item'));
  equalHeights($('.community__item'));
  equalHeights($('.infra__item'));
  equalHeights($('.video__item'));
  equalHeights($('.features__item'));
  equalHeights($('.storage-advantage__item'));
  equalHeights($('.blog__last-items-equal'));
  equalHeights($('.example__item'));
  equalHeights($('.unoc-interview__item'));
  equalHeights($('.unoc-test__equal'));
  equalHeights($('.integrators-instruments__item'));

  if (window.innerWidth >= breakpoints.md && $('.tariff__item').length > 0) {
    equalHeights($('.tariff__item'));
  }
  if (window.innerWidth >= breakpoints.sm && $('.popular__item').length > 0) {
    equalHeights($('.popular__item'));
  }

  /* =============== SIDEBAR MENU DROPDOWN TOGGLE =============== */
  $('.sidebar__menu').on('click', '.dropdown-toggle', function (e) {
    e.preventDefault();
    $(this).parent().toggleClass('active');
  });

  /* =============== MOBILE MENU INIT =============== */
  var menuMobileTrigger = $('<span/>', {
    id: 'menu-mobile__btn',
    class: 'mm__toggle toggle hidden-md hidden-lg',
    html: '<span class="toggle__btn"></span>'
  }).prependTo('body');

  var mainContainer = $('#maincontainer'),
    menuMobile = $('#menu-mobile'),
    menuMobileInit = menuMobile.multilevelpushmenu({
      containersToPush: [mainContainer, $('#menu-mobile__btn')],
      menuWidth: 220,
      menuHeight: '100%',
      collapsed: true,
      backText: 'Назад',
      backItemIcon: 'fa fa-angle-left',
      groupIcon: 'fa fa-angle-right',
      fullCollapse: true,
      onCollapseMenuEnd: function () {
        if ($('#menu-mobile').width() == 0) {
          $('#menu-mobile__btn').removeClass('toggle--active');
          $('body').removeClass('mm--opened');
        }
      },
      onItemClick: function () {
        var $item = arguments[2];
        if ($item.has('h6').length == 0) {
          var itemHref = $item.find('a:first').attr('href');
          location.href = itemHref;
        }
      }
    });

  $('body').on('click', '.mm__toggle', function () {
    $(this).toggleClass('toggle--active');

    if ($(this).hasClass('toggle--active')) {
      $('body').addClass('mm--opened');
      menuMobileInit.multilevelpushmenu('expand');
      menuMobileInit.multilevelpushmenu('option', 'menuHeight', $(document).height());
    } else {
      menuMobileInit.multilevelpushmenu('collapse');
      $('body').removeClass('mm--opened');
    }
  });

  document.addEventListener('touchstart', handleMenuMobileClose, false);
  document.addEventListener('mouseup', handleMenuMobileClose, false);

  function handleMenuMobileClose(evt) {
    if (menuMobile.has(evt.target).length === 0 && $('body').hasClass('mm--opened')) {
      menuMobileInit.multilevelpushmenu('collapse');
    }
  }

  /* =============== MENU DIFFERENT FUNCTIONS =============== */
  $('.menu-main .dropdown').hover(function () {
    $(this).addClass('open');
  }, function () {
    $(this).removeClass('open');
  });
  $('.menu-main .dropdown-toggle').click(function (e) {
    if (isMobile) {
      e.preventDefault();
    }
  });

  //check Services Pages and remove corresponding service from the list
  $('.services__item').each(function () {
    if (curPage.indexOf($('.services__header', $(this)).attr('href')) > -1) {
      $(this).remove();
    }
  });

  //add class active to all menu
  $('a[href="' + curPage + '"]').each(function () {
    checkNested($(this));
  });

  function checkNested(link) {
    var linkParent = link.parent();
    link.removeAttr('href');
    linkParent.addClass('active');
    if (linkParent.parent().prev('a').length > 0) {
      checkNested(linkParent.parent().prev('a'));
    }
  }

  /* =============== ONECLOUD SEARCH APPEARANCE =============== */
  var ocActiveClass = 'oc-appear__trigger--active';
  $('.oc-appear__trigger').click(function (e) {
    e.preventDefault();
    if (!$(this).hasClass(ocActiveClass)) {
      $('.oc-appear__trigger').removeClass(ocActiveClass);
      $(this).addClass(ocActiveClass);

      var href = $(this).attr('href');
      if (href) {
        setTimeout(function () {
          $(href).find('input[type="text"]').focus().trigger('click');
        }, 100);
      }
    }
  });
  $('.oc-appear__close').click(function () {
    $(this).parentsUntil('.oc-appear').parent().find('.oc-appear__trigger').removeClass(ocActiveClass);
  });

  document.addEventListener('touchstart', handleSearchClose, false);
  document.addEventListener('mouseup', handleSearchClose, false);

  function handleSearchClose(evt) {
    if ($('.search .oc-appear__block').has(evt.target).length === 0) {
      $('.search .oc-appear__trigger').removeClass(ocActiveClass);
    }
  }

  /* =============== ARROW UP =============== */
  var arrow = $('<div/>', {
    'id': 'arrowUp',
    'class': 'arrowUp'
  });
  $('<a/>', {
    'href': '#top',
    'title': arrowTopText,
    html: '<span class="arrowUp__arrow oc-icon-arrow"></span>'
  }).appendTo(arrow);
  $("body").append(arrow);

  $(window).scroll(function () {
    if ($(this).scrollTop() > 450) {
      $("#arrowUp").fadeIn();
    } else {
      $("#arrowUp").fadeOut();
    }
  });

  $('.goTo').click(function (e) {
    e.preventDefault();
    scrollTo($(this).attr('href'));
    return false;
  });

  $('#arrowUp').click(function (e) {
    e.preventDefault();
    scrollTo('#top');
  });

  /* =============== WHY WE BLOCK =============== */

  // Add decorative trigger for each block with a special class
  var wwTrigger = $('<span/>', {
    'class': 'why-we__trigger'
  });
  $('.why-we__item--triggered').prepend(wwTrigger);

  // Revealing information in "triggered" block
  if (window.innerWidth < breakpoints.sm) {
    $('.why-we__item--triggered:first').addClass('why-we__item--active');
  }
  $('.why-we__container').on('click', '.why-we__item--triggered', function () {
    showInfo($(this), breakpoints.sm, 'why-we__item');
  });

  /* =============== PROMO STATIC TOGGLE ACTIVE CLASSES =============== */
  $('.promo__static-item').hover(function () {
    $('.promo__static-item').removeClass('promo__static-item--active');
    $(this).addClass('promo__static-item--active');
  });

  /* =============== CMD BLOCK =============== */

  $('pre, code').each(function (i, block) {
    hljs.highlightBlock(block);
  });

  var cmdCheckHeight = 265;
  var cmdTrigger = $('<span/>', {
    'class': 'cmd__trigger',
    'data-reveal-text': cmdShowText,
    'data-hide-text': cmdHideText,
    text: cmdShowText,
    click: function () {
      var cmdTriggerParent = $(this).parent(),
        cmdTriggerParentHeight = cmdTriggerParent.attr('data-real-height');
      cmdTriggerParent.toggleClass('cmd--active');
      if (cmdTriggerParent.outerHeight() < cmdTriggerParentHeight) {
        cmdTriggerParent.css('height', cmdTriggerParentHeight);
        $(this).text($(this).attr('data-hide-text'));
      } else {
        cmdTriggerParent.removeAttr('style');
        $(this).text($(this).attr('data-reveal-text'));
      }
    }
  });

  $('.cmd').each(function () {
    if ($(this).outerHeight() > cmdCheckHeight) {
      $(this).attr('data-real-height', $(this).outerHeight() + 50);

      // assign to cmd block height "cmdCheckHeight" and append trigger
      // "cmdTrigger" (for full-height) to bottom
      // $(this).addClass('cmd--reveal').append(cmdTrigger);
    }
  });

  $('.faq-question').click(function (e) {
    $(e.target).toggleClass('active').next('.faq-ans').slideToggle();
  });

  /* =============== TESTIMONIALS BLOCK =============== */
  $('.testimonials__trigger').on('click', function () {
    $('.testimonials__text--short, .testimonials__text--full', $(this).parent().parent()).toggleClass('hidden');
    $(this).toggleClass('testimonials__trigger--active');

    var tTriggerText = $(this).text();
    $(this).text(
      tTriggerText == testimonialsShowText ? testimonialsHideText : testimonialsShowText
    );
  });

  /* =============== CAROUSEL COMMON FUNCTIONS =============== */
  var testimonialsCarousel = $('#testimonialsCarousel');

  testimonialsCarousel.owlCarousel({
    items: 1,
    loop: true,
    autoplay: true,
    nav: true,
    navText: [carouselArrowPrev, carouselArrowNext],
    autoplaySpeed: 700,
    navSpeed: 700,
    autoplayTimeout: 20000,
    responsive: {
      768: {
        items: 2
      }
      /*, 992: {
          items: 3
      }*/
    }
  }).on('refreshed.owl.carousel', addCarouselClasses(testimonialsCarousel, 'testimonials'));
  testimonialsCarousel.find('.oc-arrows').addClass('oc-arrows--primary');
  testimonialsCarousel.find('.oc-dots').addClass('oc-dots--primary');

  var sslSlider = $('#sslCarousel');
  sslSlider.owlCarousel({
    items: 1,
    loop: true,
    autoplay: true,
    nav: true,
    navText: [carouselArrowPrev, carouselArrowNext],
    autoplaySpeed: 700,
    navSpeed: 700,
    autoplayTimeout: 10000,
  }).on('refreshed.owl.carousel', addCarouselClasses(sslSlider, 'testimonials'));
  sslSlider.find('.oc-arrows').addClass('oc-arrows--primary');
  sslSlider.find('.oc-dots').addClass('oc-dots--primary');

  /* =============== TOOLTIPS =============== */
  $('.oc-tooltip').tooltip();
  $('.social__item').tooltip();

  /* =============== SWITCH DRAGGABLE =============== */
  if ($('.switch__input').length > 0) {
    if (isMobile) {
      document.addEventListener('touchstart', function (e) {
        if ($('.switch__input').has(e.target).length === 0) {
          switchStart = e.changedTouches[0].pageX;
          switchActive = $(e.changedTouches[0].target);
        }
      }, false);
      document.addEventListener('touchend', function (e) {
        if ($(e.target) != switchActive) {
          switchEnd = e.changedTouches[0].pageX;
          switchDrag(e, switchStart, switchEnd, switchActive);
        }
      }, false);
    } else {
      $(document).mousedown(function (e) {
        if ($(e.target).hasClass('switch__input')) {
          switchStart = e.pageX;
          switchActive = $(e.target);
        } else {
          switchStart = null;
        }
      }).mouseup(function (e) {
        if (switchStart !== null) {
          e.stopPropagation();
          if ($(e.target) != switchActive) {
            switchEnd = e.pageX;
            switchDrag(e, switchStart, switchEnd, switchActive);
          }
        }
      });
    }
  }

  /* =============== API TABLE ON MOBILE =============== */
  addSubtitlesToApiTables();
  function addSubtitlesToApiTables() {
    if ($('.api__table').length > 0 && window.innerWidth < 768) {
      $('.api__table').each(function () {
        var table = $(this),
          headings = [];
        if ($('.api__headings').length == 1) {
          for (var i = 0; i < $('.api__headings').children().length; i++) {
            var hText = $('.api__headings').children().eq(i).text();
            if (hText.replace(/\s/g, '') == '') {
              headings.push('');
            } else {
              headings.push(hText);
            }
          }

          for (var i = 1; i < table.children('.api__row').length; i++) {
            var row = table.children('.api__row').eq(i),
              rowElemCount = row.children().length;
            for (var j = 0; j < rowElemCount; j++) {
              if (headings[j] != '' && row.children().eq(j).children('.api__name--mobile').length < 1) {
                row.children().eq(j).prepend($('<span class="api__name--mobile"/>').text(headings[j]));
              }
            }
          }
        }
      });
    } else {
      $('.api__name--mobile').remove();
    }
  }

  /* =============== RESIZE FUNCTIONS =============== */
  $(window).resize(function () {
    checkMobile();

    menuMobileInit.multilevelpushmenu('redraw');
    if (window.innerWidth >= breakpoints.md) {
      menuMobileInit.multilevelpushmenu('collapse');
      $('body').removeClass('mm--opened');
    }

    equalHeights($('.services__item'));
    equalHeights($('.community__item'));
    equalHeights($('.infra__item'));
    equalHeights($('.video__item'));
    equalHeights($('.features__item'));
    equalHeights($('.blog__last-items-equal'));
    equalHeights($('.example__item'));
    equalHeights($('.unoc-interview__item'));
    equalHeights($('.unoc-test__equal'));

    if (window.innerWidth >= breakpoints.md && $('.tariff__item').length > 0) {
      equalHeights($('.tariff__item'));
    }
    if (window.innerWidth >= breakpoints.sm && $('.popular__item').length > 0) {
      equalHeights($('.popular__item'));
    }

    addSubtitlesToApiTables();
  });

  /* =============== PRINT =============== */
  $('.print-trigger').click(function (e) {
    e.preventDefault();
    window.print();
  });

  /* =============== DIFFERENT DECORATIONS =============== */
  $('.numberToThousands').each(function () {
    var price = $(this).text();
    if (typeof Number(price) === 'number') {
      $(this).html(numberWithThousands(price));
    }
  });

});
/* =============== GLOBAL FUNCTIONS =============== */

if (isIOs) { //HACK FOR IOS POSITION FIXED
  window.scrollTo(0, 1);
  document.documentElement.style.paddingRight = '1px';
  setTimeout(function () {
    document.documentElement.style.paddingRight = '';
  }, 0);
}

function scrollTo(id) {
  if (id == '#top') {
    $("body,html").animate({
      scrollTop: 0
    }, 1000);
  } else {
    if ($(id).length > 0) {
      $('html, body').stop().animate({
        scrollTop: $(id).offset().top
      }, 1000);
    }
  }
}
function equalHeights(elements) {
  if (elements.length > 0) {
    var height = 0;
    elements.each(function () {
      $(this).css('height', '');
      if ($(this).outerHeight() > height) {
        height = $(this).outerHeight();
      }
    });
    elements.css('height', height);
  }
}

function addCarouselClasses(elem, pref) {
  // Add special OneCloud classes to carousel controls
  var arrows = elem.find('.owl-nav'),
    dots = elem.find('.owl-dots');
  if (arrows && !arrows.hasClass('oc-arrows')) {
    arrows.addClass('oc-arrows ' + pref + '__arrows');
  }
  if (dots && !dots.hasClass('oc-dots')) {
    dots.addClass('oc-dots ' + pref + '__dots');
  }
}

function showInfo(obj, res, nameClass) {
  // Add special active classes to similar blocks, depending on device size
  if (window.innerWidth < res) {
    $(obj).siblings().removeClass(nameClass + '--active');
    $(obj).toggleClass(nameClass + '--active');
  }
}

function toggleOcStickyBlock(sId, sMainId) {
  var sMainBlock = $(sMainId),
    sBlock = $(sId),
    sParent = $(sId).parent(),
    sBlockHeight = sBlock.outerHeight();

  $(window).scroll(function () {
    var wHeight = $(window).outerHeight(),
      orderOffset = sParent.offset().top;

    if ($(this).scrollTop() < (orderOffset + sBlockHeight - wHeight) && $(this).scrollTop() > sMainBlock.offset().top - 50) {
      sBlock.addClass('oc-sticky');
      sParent.css('padding-top', sBlockHeight);
    } else {
      sBlock.removeClass('oc-sticky');
      sParent.css('padding-top', '');
    }
  });
}

/*
* Function to set non-breaking spaces into thousands rank
*/
function numberWithThousands(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&nbsp;");
}

function initializeBS(bsList) { // Bootstrap Selectpicker
  if (window.innerWidth >= breakpoints.sm) {
    $(bsList).selectpicker({
      'width': '100%'
    });
  } else {
    $(bsList).selectpicker('destroy');
  }
}

function checkBonus(selectId) {
  var os = $(selectId).find('option:selected').attr('data-os');
  if (os === 'Windows') {
    return true;
  } else {
    return false;
  }
}

function switchDrag(ev, start, end, sObj) {
  ev.stopPropagation();
  if (typeof sObj !== 'undefined') {
    if (start < end && $(sObj).next().next().hasClass('switch__input') && !$(sObj).next().next().prop('disabled')) {
      $(sObj).parent().find('.switch__input').prop('checked', false);
      $(sObj).next().next().prop('checked', true);
    } else if (start > end && $(sObj).prev().prev().hasClass('switch__input') && !$(sObj).prev().prev().prop('disabled')) {
      $(sObj).parent().find('.switch__input').prop('checked', false);
      $(sObj).prev().prev().prop('checked', true);
    }
    sObj.change();
  }
}

/* =============== FORMS =============== */

function initMessageForm(formSelector, cbSuccess, goalClickId, goalSuccessId) {
  var form = $(formSelector);

  if (form) {
    var formBtn = form.find('[type="button"]');
    var validator = form.validate({
      onkeyup: false,
      onfocusin: function (element) {
        errorMessageRemove($(element));
      },
      rules: {
        'Name': 'required',
        'Email': {
          required: true,
          email: true
        },
        'Subject': 'required',
        'Body': 'required',
      },
      highlight: function (element) {
        $(element).parent().addClass('error');
      },
      errorElement: 'span',
      errorClass: 'hidden error__message'
    });

    if (formBtn) {
      formBtn.on('click', function (e) {
        e.preventDefault();
        if (typeof goalClickId === 'string') {
          reachCounterGoal(goalClickId);
        }

        if (validator.form() && form.find('[name="Empty"]').val() === '') {
          sendPostRequest('#' + form.attr('id'), form.attr('action'), getMessageModel(), function () {
            if (typeof goalSuccessId === 'string') {
              reachCounterGoal(goalSuccessId, 'submit');
            }
            if (typeof cbSuccess === 'function') {
              cbSuccess();
            }
          });
          validator.resetForm();
        }
      });
    }
  } 

  function getMessageModel() {
    var obj = {};
    obj.Name = form.find('[name="Name"]').val();
    obj.Email = form.find('[name="Email"]').val();
    obj.Subject = form.find('[name="Subject"]').val();
    obj.Body = form.find('[name="Body"]').val();
    return obj;
  };
}

function initRegistrationForm(formSelector, goalClickId, goalSuccessId) {
  var $form = $(formSelector);

  if ($form) {
    var $defaultBtn = $form.find('[type="button"]');
    var $formBtn = ($defaultBtn.length > 0) ? $defaultBtn : $form.find('[type="submit"]');
    var $emailField = $form.find('[name="Email"]');

    if ($formBtn) {
      $form.submit(function (e) {
        e.preventDefault();
        $formBtn.trigger('click');
      })
      $formBtn.click(function (e) {
        e.preventDefault();
        var email = $emailField.val();

        if (typeof goalClickId === 'string') {
          reachCounterGoal(goalClickId);
        }

        if ($form.find('[name="Empty"]').val() !== '') {
          return;
        }

        if (email === '') {
          errorMessageAdd($emailField, errorMsgEmptyField);
          return;
        }

        if (!checkEmail(email)) {
          errorMessageAdd($emailField, errorMsgInvalidEmail);
          return;
        }

        sendPostRequest('#' + $form.attr('id'), $form.attr('action'), { Email: email }, function () {
          if (typeof goalSuccessId === 'string') {
            reachCounterGoal(goalSuccessId, 'submit');
          }

          window.location.href = $form.data('success');
        });
      });
    }
  }
}

function checkEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function errorMessageAdd(errObj, errMsg) {
  var errObjParent = errObj.parent();
  if (errObjParent.hasClass('error')) {
    return;
  } else {
    var errorNew = errorElem.clone();
    errObjParent.addClass('error');
    errorNew.html(errMsg).appendTo(errObjParent);
    if (!errObj.closest('form').hasClass('form--column')) {
      errorMessagePlace(errorNew);
    }
    errObj.on('click mousedown change', function () {
      errorMessageRemove(errObj);
      setTimeout(function () {
        $(errObj).focus();
      }, 100);
    });
    if (errObj.siblings('.btn').length > 0) {
      errObj.siblings('.btn').bind('click',
        function () {
          errorMessageRemove(errObj);
        });
    }
  }
}
function errorMessageRemove(errObj) {
  var errObjParent = errObj.parent();
  errObjParent.removeClass('error');
  errObjParent.find(errorElemSelector).remove();
}
function errorMessagePlace(obj) {
  var objHeight = obj.outerHeight() + 7; // 7 - height of decoration (sqrt(10*10 + 10*10)/2)
  obj.css({
    'top': -objHeight,
    'bottom': 'auto'
  });
}

/* =============== REQUESTS =============== */

var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;

function sendGetRequest(url, func) {
  var requestXhr = new XHR();

  requestXhr.open('GET', url, true);
  requestXhr.send();

  requestXhr.onreadystatechange = function () {
    if (requestXhr.readyState != 4) return;

    if (requestXhr.status == 200) {
      if (requestXhr.getResponseHeader('Content-Type') == 'application/json; charset=utf-8') {
        func(JSON.parse(this.responseText));
      }
    } else {
      alert('Возникла ошибка (' + requestXhr.status + ') - ' + requestXhr.statusText);
      return;
    }
  }
}

function addRequestVerificationToken(blockId, data) {
  data.__RequestVerificationToken = $(blockId).find('input[name=__RequestVerificationToken]').val();
  return data;
};

function sendPostRequest(blockId, url, obj, successFunction, errFunction) {
  // submitting trigger must have [data-type="submit"] attribute

  var sendBtn = $(blockId).find('[data-type="submit"]'),
    forgery = $(blockId).find('[name="__RequestVerificationToken"]'),
    isSent = false;

  if (sendBtn.length !== 0) {
    if (!sendBtn.hasClass('loading')) {
      sendBtn.addClass('loading');
    } else {
      isSent = true;
      return false;
    }
  }

  if (!isSent) {
    $.ajax({
      type: "POST",
      context: (forgery.length > 0) ? document.body : this,
      url: url,
      data: (forgery.length > 0) ? addRequestVerificationToken(blockId, obj) : JSON.stringify(obj),
      dataType: "json",
      success: function (data) {
        if (sendBtn.length !== 0) {
          sendBtn.removeClass('loading');
        }

        if (typeof successFunction === 'function') {
          successFunction(data);
        }

        if (data.redirectTo) {
          window.location.href = data.redirectTo;
        }
      },
      error: function (data, status) {
        if (sendBtn.length !== 0) {
          sendBtn.removeClass('loading');
        }
        handleAjaxErrors(data, blockId, errFunction);
      }
    });
  }
}
function sendSimplePostRequest(url, obj, successFunc, processFunc, errFunction) {
  if (processFunc != undefined) {
    processFunc();
  }

  $.ajax({
    type: "POST",
    url: url,
    data: obj,
    dataType: "json",
    traditional: true,
    success: function (data) {
      successFunc(data);
    },
    error: function (data, status) {
      handleAjaxErrors(data, null, errFunction);
    }
  });
}

function handleAjaxErrors(data, blockId, errorFunction) {
  if (data.status == 500) {
    showServerErrorBootstrapModal();
    return;
  }

  if (data.responseJSON != undefined) {
    var errObj = (typeof data.responseJSON === 'string') ? JSON.parse(data.responseJSON) : data.responseJSON;
    var errorRange = Number(data.status) - 400;

    if (errorRange >= 0 && errorRange < 100 && typeof errObj.ModelState !== 'undefined') {
      var errArray = Object.keys(errObj.ModelState);
      if (errArray.length === 1 && errArray[0] === '') {
        showSummaryMessage(errObj.ModelState[''].toString(), blockId);
      } else {
        for (var i = 0; i < errArray.length; i++) {
          var errElem = (blockId === null) ? $('[name="' + errArray[i] + '"]') : $(blockId).find('[name="' + errArray[i] + '"]');
          if (errElem.parent().find('.error__message').length > 0) {
            errorMessageRemove(errElem);
          }
          errorMessageAdd(errElem, errObj.ModelState[errArray[i]].toString().replace(/\n/g, '<br />'));
        }
      }

      if (errorFunction != undefined) {
        errorFunction(errObj.ModelState);
      }
    } else {
      var errMsg = (errObj.Message) ? errObj.Message : data;
      if ($(errorSummarySelector).length > 0) {
        $(errorSummarySelector + ' p').text(errMsg);
      } else {
        showSummaryMessage(errMsg, blockId);
      }

      if (typeof errorFunction === 'function') {
        errorFunction(errMsg);
      }
    }
  } else {
    console.log(data);
  }
}

function showSummaryMessage(msg, blockId) {
  var errMsgBlock = $('<div />', {
    class: errorSummaryClass,
    'html': '<p>' + msg + '</p>'
  });
  var errMsgBlockClose = $('<span/>', {
    class: 'fa fa-close error__summary-close',
    click: function () {
      $(this).closest(errorSummarySelector).remove();
    }
  });
  errMsgBlock.append(errMsgBlockClose);

  if (blockId !== null) {
    $(blockId).prepend(errMsgBlock);
  } else {
    errMsgBlock.insertAfter($('h1.heading__text').parent());
  }
}

function showServerErrorBootstrapModal() {
  var modalBlock = $('<div />', {
    'id': 'modalServerError',
    'class': 'modal onecloud__modal onecloud__modal--error fade'
  }),
    modalDialog = $('<div class="modal-dialog"/>'),
    modalContent = $('<div class="modal-content"/>'),
    modalHeader = $('<div />', {
      'class': 'modal-header',
      'html': '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h3 class="modal-title">' + textServerErrorTitle + '</h3>'
    }),
    modalBody = $('<div />', {
      'class': 'modal-body',
      'html': textServerError
    }),
    modalFooter = $('<div />', {
      'class': 'modal-footer',
      'html': '<button type="button" class="btn btn-default" data-dismiss="modal">OK</button>'
    });

  modalContent.append(modalHeader, modalBody, modalFooter).appendTo(modalDialog);
  modalBlock.append(modalDialog).modal('show');
}

/* =============== MODAL HELPFUL FUNCTIONS (addToModal, checking (required jquery validate), showErrors in modal) =============== */
function addSelectToModal(id, modalBody) {
  var newId = id.substr(1, id.length - 1) + '-in-modal';

  modalSelect = $('<div/>', {
    'class': 'form-group'
  }).append($('<select/>', {
    'id': newId,
    class: 'form-control form-select',
    'name': newId,
    'html': $(id).html(),
    'val': $(id).val()
  }));
  modalBody.prepend(modalSelect);
  isValidFieldToModal(id);

  if (window.innerWidth >= breakpoints.sm) {
    $('#' + newId).selectpicker({
      'width': '100%',
      'val': $(id).val()
    });
  }

  $('#' + newId, modalSelect).change(function () {
    checkFieldInModal($(this), modalBody);
  });
}
function addInputToModal(id, modalBody) {
  var newId = id.substr(1, id.length - 1) + '-in-modal';
  modalInput = $('<div/>', {
    'class': 'form-group'
  }).append($('<input/>', {
    'id': newId,
    class: 'form-control input-sm',
    'name': newId,
    'type': $(id).attr('type'),
    'val': $(id).val(),
    'placeholder': $(id).prop('placeholder')
  }));

  modalBody.prepend(modalInput);
  isValidFieldToModal(id);

  $('#' + newId, modalInput).change(function () {
    checkFieldInModal($(this), modalBody);
  });
}
function isValidFieldToModal(objId) {
  if (!$(objId).valid() || ($(objId).next(errorElemSelector).length > 0 && $(objId).next(errorElemSelector).text() != '')) {
    var errText = $(objId).next(errorElemSelector).html(),
      errTitle = $(objId).attr('data-modal-title'),
      errId = 'err-' + objId.substr(1, objId.length - 1),
      errBlock = checkModalErrorBlockExists(calcModalBody);

    $(objId).parent().addClass('error');
    errBlock.append($('<p/>',
      {
        id: errId,
        'html': '<strong>' + errTitle + ':</strong> ' + errText
      })
    );

  }
}
function checkFormElemErrorsExist(obj) {
  var checkErrorelem = $(obj).next(errorElemSelector);

  return !(checkErrorelem.length < 1 || checkErrorelem.text() == '');
}
function checkModalErrorBlockExists(modalBody) {
  var modalErrBlock = modalBody.find('.form-message');
  if (modalErrBlock.length < 1) {
    modalBody.append($('<div/>', { class: 'form-message bg-danger text-left' }));
    modalErrBlock = modalBody.find('.form-message');
  }
  return modalErrBlock;
}
function checkFieldInModal(obj, modalBody) {
  var realElemId = obj.attr('id').replace('-in-modal', ''),
    errModalBlock = checkModalErrorBlockExists(modalBody);
  errModalMsgId = 'err-' + realElemId,
    errModalElem = errModalBlock.find('#' + errModalMsgId),
    errModalTitle = $('#' + realElemId).attr('data-modal-title'),
    result = false;

  //errorMessageRemove($('#' + realElemId));
  $('#' + realElemId).val(obj.val());
  if ($('#' + realElemId).valid()) {
    errModalElem.remove();
    $('#' + realElemId).parent().removeClass('error');

    if (modalBody.find('.form-message').html() == '') {
      modalBody.find('.form-message').remove();
    }
    if ($('#' + realElemId).hasClass('form-select')) {
      $('#' + realElemId).change();
    }

    result = true;
  } else {
    if (errModalElem.length < 1) {
      errModalBlock.append($('<p/>', {
        id: errModalMsgId
      }));
      errModalElem = errModalBlock.find('#' + errModalMsgId);
    }
    errModalElem.html('<strong>' + errModalTitle + ':</strong> ' + $('#' + realElemId).next(errorElemSelector).html());
  }
  return result;
}

/* =============== COOKIES =============== */
function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options) {
  options = options || {};

  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000 * 60 * 60 * 24);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}
function deleteCookie(name) {
  setCookie(name, "", {
    expires: -1
  })
}

/* =============== MARKETING ================*/

/**
 * 
 * @param {string} goalId - (required) goal indentifier for all counters
 * @param {string} goalType - (optional) event type: 'click'(default), 'try', 'submit'. ONLY FOR GOOGLE ANALYTICS
 */
function reachCounterGoal(goalId, goalType) {
  var yaCounter = (typeof yaCounter17861131 !== 'undefined') ? yaCounter17861131 : null;
  var googleCounter = (typeof gtag === 'function') ? gtag : null;
  var evtType = goalType || 'click';

  if (goalId) {
    if (yaCounter) {
      yaCounter.reachGoal(goalId);
    }
    if (googleCounter) {
      googleCounter('event', goalId, {
        'event_category': evtType
      });
    }
  }

  return true;
}