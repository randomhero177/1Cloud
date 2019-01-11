
price.current_image_license = 0;

price.GetServerPrice = function GetServerPrice() {
  var cpu = parseInt(this.current_cpu_val);
  var ram = parseInt(this.current_ram_val) >= 500 ? parseInt(this.current_ram_val) : parseInt(this.current_ram_val) * 1024;
  var hdd = parseInt(this.current_hdd_val);
  var cpu_amount = this.cpu_price * cpu;
  var ram_amount = (this.ram_price / 4) * ram / 256;
  var NetworkBandwidth_amount = (typeof this.current_NetworkBandwidth_val !== 'undefined') ? (this.current_NetworkBandwidth_val - 10) * this.net_bandwidth_price : 0;

  _hdd_price = this.hdd_sas_price;
  if ($('div.order-config #HDDType').length > 0 && $('div.order-config #HDDType').val() == "SSD") {
    _hdd_price = this.hdd_ssd_price;
  } else {
    if ($('div.order-config #HDDType').length > 0 && $('div.order-config #HDDType').val() == "SSD") { _hdd_price = this.hdd_ssd_price; }
  }

  var hdd_amount = _hdd_price * hdd;
  var total = Math.round((cpu_amount + ram_amount + hdd_amount + price.current_image_license + NetworkBandwidth_amount) * 100) / 100;
  return total;
}
price.GetSnapshotPrice = function GetSnapshotPrice() {
  var hdd = parseInt(this.current_hdd_val) + GetAdditionalDiskSpace();
  var snapshot_amount = this.snapshot_price * hdd;
  var total = Math.round((snapshot_amount) * 100) / 100;
  return total;
}
price.GetBackupPrice = function GetBackupPrice() {
  var server_disk = parseInt(this.current_hdd_val);
  var additional_disk = GetAdditionalDiskSpace();

  var hdd = server_disk + additional_disk;

  var period = parseInt(this.current_backup_period);
  var backup_amount = (period / 7) * (this.backup_price * hdd);
  var total = Math.round((backup_amount) * 100) / 100;
  return total;
}
function GetAdditionalDiskSpace() {
  var additional_disk = 0;
  $("#list_disks .add-disk__size").each(function (index) {
    additional_disk += parseInt($(this).val())
  });
  return additional_disk;
}

price.GetAdditionalDiskPrice = function GetAdditionalDiskPrice() {
  var total = 0;
  _this = this;

  $("#list_disks .add-disk__size").each(function (index) {
    var disk_space = $(this).val();
    var diskType = $(this).closest('tr').find('.add-disk__type').val();
    var disk_price = 0;

    switch (diskType) {
      case 'SSD':
        disk_price = _this.hdd_ssd_price;
        break;
      case 'SATA':
        disk_price = _this.hdd_sata_price;
        break;
      default:
        disk_price = _this.hdd_sas_price;
    }

    total += disk_space * disk_price;
  });

  return total;
}
price.ShowNeedPayment = function ShowNeedPayment(parentelementClass, total) {
  var user_balance = parseInt($('#user-balance').data("balance-money"));
  var byweek = parseInt(Math.round((total / 4) * 100) / 100);
  var monthPay = Math.round((total) * 100) / 100;
  if ((monthPay > 8420 || this.current_cpu_val > 8 || this.current_ram_val > 16384 || this.current_hdd_val > 500) && user_balance < byweek) {
    $('.' + parentelementClass + ' .need-add-money').removeClass('hidden');
    $('.' + parentelementClass + ' .need-add-money #need-money-count').text(byweek);
  }
  else {
    $('.' + parentelementClass + ' .need-add-money').addClass('hidden');
  }
}
price.Calculate = function Calculate() {
  var total = this.GetServerPrice();
  var totalItems = ($('.server__name-item').length > 1) ? $('.server__name-item').length : 1;
  if (this.current_isbackupOn) {
    total = total + this.GetBackupPrice();
  }
  var monthPay = Math.floor(total),
    dayCost = Math.round((total / 30) * 100) * totalItems / 100,
    hourCost = Math.round((total / (30 * 24)) * 100) * totalItems / 100;
  //$('#year span.cost').html(Math.floor(monthPay * 12));
  $('#month span.cost').html(monthPay * totalItems);
  $('#day span.cost').html(dayCost.toString().replace(".", ","));
  $('#hour span.cost').html(hourCost.toString().replace(".", ","));

  this.ShowNeedPayment('order-price', total);
};
