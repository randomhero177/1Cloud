$(function () {

    var options = {
        max_value: 5,
        step_size: 1,
        initial_value: 5,
        symbols: {},
        selected_symbol_type: 'utf8_star',
        convert_to_utf8: false,
        cursor: 'pointer',
        readonly: false,
        change_once: false,
        ajax_method: 'POST',
        url: urlSendRating,
        additional_data: techTitle,
        only_select_one_symbol: false
    };

    $(".rating").rate(options);

    $(".rating").on("updateSuccess", function () {
        $('#rating-success').removeClass('hidden');
        $('#rating-average').addClass('hidden');
        $(".rating").remove();
    });
    $(".rating").on("updateError", function () {
        $('#rating-error').removeClass('hidden');
    });
});
