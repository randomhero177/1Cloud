/*
  required JQuery & Bootstrap (modal plugin)
*/

var Helper = function (options) {
  var myHelper = this;
  this.options = {
    delay: 5000,
    cb: '',
    containerPadding: 15
  };
  this.init = function () {
    var helperBlock = $('#helper'),
        helperModal = $('#helper-modal');

    this.getOptions(options);
    this.showHelper(helperBlock, helperModal);
  };

  /*
  ** Rewrite function options
  ** @obj options - object with new properties
  */
  this.getOptions = function (options) {
    if (options) {
      var optionsArr = Object.keys(options);
      for (var i = 0; i < optionsArr.length; i++) {
        this.options[optionsArr[i]] = options[optionsArr[i]];
      }
    }
  };

  this.showHelper = function (helper, modal) {
      var helperPosition = (window.innerWidth - $('.container').width()) / 2 - this.options.containerPadding / 2;
      var helperTimeout = setTimeout(function () {
          helper.css('right', helperPosition).fadeIn();
          helper.on('click', '.helper__btn', function () {
              modal.modal('show');
              if (typeof myHelper.options.cb === 'function') {
                myHelper.options.cb();
              }
              helper.hide();
          })
          .on('click', '.helper__close', function () {
              helper.hide();
          });
          clearTimeout(helperTimeout);
      }, this.options.delay);
  };
};
