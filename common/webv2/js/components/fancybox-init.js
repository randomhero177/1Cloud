$(function () {
  $('.gallery__item, .fancy').fancybox();
  $('.video__item').fancybox({
		padding: 0,
		helpers : {
			media : {}
		}
	});
});
