$(function () {
  initRegistrationForm('#hosting-top-form', null, 'siteownersregtop');
  initRegistrationForm('#registr-block-form', null, 'siteownersgetacessreg');
  initMessageForm('#consult-form', null, null, 'sentquestionsiteowners');

  var partnersCarousel = $('#partnersCarousel');
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

});
