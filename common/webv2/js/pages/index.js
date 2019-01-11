$(function () {
  initMessageForm('#consultation-form', messageAjaxSuccess, 'askkonsul', 'askformsent');
  initRegistrationForm('#topblock-form', 'regtop', 'registrationmain');
  initRegistrationForm('#registr-block-form', 'regmiddle', 'registrationmain');

  $('.question__item-title').click(function (e) {
    var block = $(this).parents('.question__item')
    block.find('.question__item-text').slideToggle();
    block.toggleClass('active');
  });

  $(window).resize(function () {
    if (window.innerWidth > 767) {
      topFormClose.trigger('click');
    }
  });

  /* =============== TOPBLOCK SECTION =============== */
  var topForm = $('#topblock-form'),
    topFormTrigger = $('.topblock__form-trigger'),
    topFormClose = $('.topblock__form-close');

  if (topForm && topFormTrigger && topFormClose) {
    topFormTrigger.click(function (e) {
      e.preventDefault();
      document.body.classList.add('topblock--opened');
    });

    topFormClose.click(function (e) {
      e.preventDefault();
      document.body.classList.remove('topblock--opened');
    });
  }

  /* =============== CAROUSELS INIT =============== */
  var promoCarousel = $('#promoCarousel'),
    benefitsCarousel = $('#benefitsCarousel'),
    partnersCarousel = $('#partnersCarousel');

  // function "addCarouselClasses" is defined in common.js
  promoCarousel.owlCarousel({
    items: 1,
    loop: true,
    autoplay: true,
    nav: true,
    navText: [carouselArrowPrev, carouselArrowNext]
  }).on('refreshed.owl.carousel', addCarouselClasses(promoCarousel, 'promo'));

  partnersCarousel.owlCarousel({
    items: 1,
    loop: true,
    autoplay: true,
    nav: true,
    navText: [carouselArrowPrev, carouselArrowNext],
    dots: false,
    margin: 30,
    responsive: {
      480: {
        items: 2
      },
      768: {
        items: 3
      },
      992: {
        items: 4
      }
    }
  }).on('refreshed.owl.carousel', addCarouselClasses(partnersCarousel, 'partners'));

  var benItemActive = 'benefits__info-item--active',
    benSectionActive = 'benefits__info-section--active';

  benefitsCarousel.on('initialized.owl.carousel', function () {
    benefitsCarousel.find('.owl-item').each(function () {
      if ($(this).index() !== 0 && $(this).index() !== 1) {
        $(this).addClass('not-active-close');
      }
    });
    benefitsCarousel.find('.owl-prev').addClass('hidden');
    $('.benefits__info-item:first').addClass(benItemActive);
    highlightBenefit();
  })
    .owlCarousel({
      center: true,
      items: 1,
      loop: false,
      nav: ($('.benefits__info > .benefits__info-item').length > 1) ? true : false,
      navText: [carouselArrowPrev, carouselArrowNext],
      dots: false
    })
    .on('refreshed.owl.carousel', addCarouselClasses(benefitsCarousel, 'benefits'))
    .on('translated.owl.carousel', function (event) {
      var activeElem = event.item.index,
        totalElem = event.item.count;

      benefitsTranslateAction(activeElem, totalElem);
      equalHeights($('.benefits__info-item--active .benefits__info-section'));
    });
  $('.benefits__info-section').hover(function () {
    if (window.innerWidth > 991) {
      $(this).siblings().removeClass(benSectionActive);
      $(this).addClass(benSectionActive);
    }
  });
  $('.benefits__info-item').on('click', '.benefits__info-section', function () {
    showInfo($(this), 992, 'benefits__info-section');
  });

  function benefitsTranslateAction(aE, tE) {
    switch (aE) {
      case 0:
        $('.owl-prev', benefitsCarousel).addClass('hidden');
        $('.owl-next', benefitsCarousel).removeClass('hidden');
        break;
      case (tE - 1):
        $('.owl-next', benefitsCarousel).addClass('hidden');
        $('.owl-prev', benefitsCarousel).removeClass('hidden');
        break;
      default:
        benefitsCarousel.find('.owl-nav > *').removeClass('hidden');
    }

    benefitsCarousel.find('.owl-item').each(function () {
      if ($(this).index() === aE || $(this).index() === aE - 1 || $(this).index() === aE + 1) {
        $(this).removeClass('not-active-close');
      } else {
        $(this).addClass('not-active-close');
      }
    });
    highlightBenefit();
  }

  function highlightBenefit() {
    var currentItem = $(benefitsCarousel).find('.owl-item.active'),
      currentBlock = $(currentItem).find('.benefits__carousel-item').attr('data-info');

    $('.benefits__info-item').removeClass(benItemActive);
    $('.benefits__info-section').removeClass(benSectionActive);

    $(currentBlock).find('.benefits__info-section:eq(2)').addClass(benSectionActive);

    $(currentBlock).addClass(benItemActive);
    if (window.innerWidth > 991) {
      equalHeights($('.benefits__info-item--active .benefits__info-section'));
    }
  }

  function messageAjaxSuccess() {
    var modalForm = $('#consultation-form'),
      modalFormId = modalForm.attr('id');

    modalForm[0].reset();
    modalForm.replaceWith($('<div />', {
      id: modalFormId + '-success',
      'html': '<p class="alert alert-success text-center">' + textSent + '</p><p class="text-center">В ближайшее время на указанный email <br />вам ответит наш сотрудник</p>'
    }));
  }

  /* =============== RESIZE FUNCTIONS =============== */
  $(window).resize(function () {
    if (window.innerWidth > 991) {
      equalHeights($('.benefits__info-item--active .benefits__info-section'));
    } else {
      $('.benefits__info-section').css('height', 'auto');
    }
    if (window.innerWidth > 767) {
      $('.why-we__item:first').removeClass('why-we__item--active');
    }
  });
});
