var softischange = false;

$(function () {
  if (typeof softsJson !== 'undefined') {
    HideSubmitButton();
    UpdateTotalCost();
    InitSoftScripts();
  }
})
function InitSoftScripts() {

  $('section.list_soft_on_si #add_block').click(function () {
    AddNewSoft();
  });
  $('#edit_softs').click(function () { SubmitSoftChanges(); });

  $('.soft_delete').click(function () { DeleteSoft(this); });

  $('.license-activate__param input').each(function () {
    if ($(this).val() != '') {
      $(this).next('label').addClass('stay');
    }
  });
  $('.license-activate__param input').change(function () {
    if ($(this).val() != '') {
      $(this).next('label').addClass('stay');
    } else {
      $(this).next('label').removeClass('stay');
    }
  });

  var defaultRangeValidator = $.validator.methods.range;
  $.validator.methods.range = function (value, element, param) {
    if (element.type === 'checkbox') {
      return element.checked;
    } else {
      return defaultRangeValidator.call(this, value, element, param);
    }
  }
}
function AddNewSoft() {
  softischange = true;
  var preSelectedSoft = softsJson[0];

  var newtr = '<tr><td class="leftalign"><input data-val="true" class="SoftId" id="OrderSoftLines_#NEWINDEX#__SoftId" name="OrderSoftLines[#NEWINDEX#].SoftId" type="hidden" value="' + preSelectedSoft.ID + '"><select class="soft_type">';
  for (var i = 0; i < softsJson.length; i++) {
    newtr += '<option value="' + softsJson[i].ID + '" data-auto-activation="' + softsJson[i].ISAutoActivation + '">' + softsJson[i].Title + '</option>';
  }
  newtr += '</select></td>';

  if (preSelectedSoft.IsNumerableLicense) {
    newtr += '<td><input class="CountLicense" data-val="true" id="OrderSoftLines_#NEWINDEX#__CountLicense" name="OrderSoftLines[#NEWINDEX#].CountLicense" type="hidden" value="' + preSelectedSoft.MinCount + '">' + GetCountSelection(preSelectedSoft.MinCount, preSelectedSoft.MaxCount) + '</td>';
  }
  else {
    newtr += '<td class="count_license"><span>1</span><input class="CountLicense" data-val="true" id="OrderSoftLines_#NEWINDEX#__CountLicense" name="OrderSoftLines[#NEWINDEX#].CountLicense" type="hidden" value="1"></td>';
  }

  newtr += '<td><span class="soft_amount">' + preSelectedSoft.Price.Amount + '</span></td>';
  newtr += '<td><div class="soft_delete delete-item-list">' + resources.Delete + '<div></td>';

  if ($('#list_softs tbody tr:last').length == 0) {
    $('#list_softs tbody').append(newtr);
  }
  else {
    $('#list_softs tbody tr:last').after(newtr);
  }
  $(".soft_type").chosen({ disable_search_threshold: 10, width: '100%', no_results_text: resources.JS_Choosen_NoResults, size: 4 }).change(function (e, params) {
    ChangeSoftType(this);
    UpdateSoftCosts($(this).parent().parent());
  });
  $(".lic_count").chosen({ disable_search_threshold: 10, no_results_text: resources.JS_Choosen_NoResults, size: 4 }).change(function (e, params) {
    ChangeSoftCount(this);
    UpdateSoftCosts($(this).parent().parent());
  });
  $(".lic_count").change();

  $('.soft_delete').click(function () { DeleteSoft(this); })
  UpdateTotalCost();
  DisplayActivationDataBlock();
}

function GetCountSelection(minCount, maxCount) {
  var newSelect = '<select  class="lic_count">';
  for (var i = minCount; i <= maxCount; i++) {
    newSelect += '<option value="' + i + '">' + i + '</option>';
  }
  newSelect += '</select>';
  return newSelect;
}
function ChangeSoftType(e) {
  var currentValue = parseInt($(e).val());
  var soft = $.grep(softsJson, function (e) { return e.ID == currentValue; })[0];
  newCountLic = '<td class="count_license"><span>1</span><input class="CountLicense" data-val="true" id="OrderSoftLines_#NEWINDEX#__CountLicense" name="OrderSoftLines[#NEWINDEX#].CountLicense" type="hidden" value="1"></td>';
  if (soft.IsNumerableLicense) {
    newCountLic = '<td><input class="CountLicense" data-val="true" id="OrderSoftLines_#NEWINDEX#__CountLicense" name="OrderSoftLines[#NEWINDEX#].CountLicense" type="hidden" value="' + soft.MinCount + '">' + GetCountSelection(soft.MinCount, soft.MaxCount) + '</td>';
  }
  $(e).parent().next().replaceWith(newCountLic);
  $(".lic_count").chosen({ disable_search_threshold: 10, no_results_text: resources.JS_Choosen_NoResults, size: 4 }).change(function (e, params) { ChangeSoftCount(this); UpdateSoftCosts($(this).parent().parent()); });

  DisplayActivationDataBlock()
}
function ChangeSoftCount(e) {
  var trElement = $(e).parent().parent();
  var currentCountLicense = $(e).val();

  $(trElement).find('.CountLicense').val(currentCountLicense);
}

function UpdateSoftCosts(e) {
  var softId = parseInt($(e).find('.soft_type').val());
  var soft = $.grep(softsJson, function (e) { return e.ID == softId; });
  $(e).find('.SoftId').val(softId);

  var lic_count = 1;
  if ($(e).find('.lic_count').length > 0) {
    lic_count = parseInt($(e).find('.lic_count').val());
  }
  var amount = soft[0].Price.Amount * lic_count
  $(e).find('.soft_amount').text(amount);

  UpdateTotalCost();
  ShowNeedPaymentOnSoft();
}

function UpdateTotalCost() {
  var total = 0;
  $('section.list_soft_on_si .soft_amount').each(function () {
    total += parseInt($(this).text());
  });

  $('section.list_soft_on_si #server-soft-price').text(total);
  $('section.list_soft_on_si #need-money-count').text(total / 4);
}

function DeleteSoft(e) {
  $(e).parent().parent().remove();
  if ($('#list_softs').find('.soft_delete').length < 1) {
    $('.server-soft-price .need-add-money').addClass('hidden');
  }
  UpdateTotalCost();
  DisplayActivationDataBlock();
}

function SubmitSoftChanges() {
  softischange = true;
  softDataValid = true;

  $('.license-activate__param input').each(function () {
    if (!$(this).valid()) { softDataValid = false; return; }
  });

  if (softDataValid) {
    $("section.list_soft_on_si table#list_softs tbody tr").each(function (index) {
      var str = $(this).html();
      str = str.replace(/#NEWINDEX#/gi, index);
      $(this).html(str);
    });
  }
}

function HideSubmitButton() {
  if (softsJson.length == 0) {
    $('section.list_soft_on_si #add_block').addClass('hidden');
    $('section.list_soft_on_si #edit_softs').addClass('hidden');
  }
}

function ShowNeedPaymentOnSoft() {
  var total_soft_price = parseInt($('section.list_soft_on_si #need-money-count').text());

  if (total_soft_price > 500 && softischange == true) {
    $('.list_soft_on_si .need-add-money').removeClass('hidden');
  }
  else { $('.list_soft_on_si .need-add-money').addClass('hidden'); }
}

function checkListAutoActivation() {
  var result = true;
  $('#list_softs option:selected').each(function () {
    var aa = $(this).attr('data-auto-activation');
    if (aa !== undefined) {
      aa = (aa == 'true' ? true : false);
      if (!aa) {
        result = false;
      }
    }
  });
  return result;
}

function ShowDataBlock() {
  if ($('.license-activate:visible').length < 1) {
    $('.license-activate').slideDown();
  }
}
function HideDataBlock() {
  if ($('.license-activate:visible').length > 0) {
    $('.license-activate').slideUp();
  }
}

function DisplayActivationDataBlock() {
  if ($('#list_softs').find('.soft_delete').length > 0) {
    if (!checkListAutoActivation()) {
      ShowDataBlock();
    } else {
      HideDataBlock();
    }
  } else {
    HideDataBlock();
  }
}