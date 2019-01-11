const apidocCategoryConfig = {  
    deleteCategoryForm: document.querySelector('#remove-apidoc-category-form'),
    deleteCategoryBtn: document.querySelector('#remove-apidoc-category-btn'),
    createCategoryBtn: document.querySelector('#create-apidoc-category-btn'),
    addCategoryHeader: document.querySelector('#form-title'),
    addCategoryBtn: document.querySelector('#apidoc-category-btn'),
    addCategoryForm: document.querySelector('#apidoc-category-form'),
    techTitleInput: document.querySelector('#tech-title-inp'),
    categoryDataRow: 'apidoc-data-row',
    actionIcon: '.apidoc-action-icon',
    deleteCategoryModalSelector: '#remove-apidoc-category',
    checkbox: '#isPrivate-checkbox'
};
$(function () {
    let c = apidocCategoryConfig;
//    let delBtn = c.deleteZoneForm.querySelector('.btn-primary');
    var curModelObj = {},
        curLink,
        isAddCategory = true;

    // fill model and inputs
    $(c.actionIcon).click(function (e) {
        let curRow = $(this).parents('.' + c.categoryDataRow);
        curModelObj.Id = curRow.data('category');
        curModelObj.Title = c.addCategoryForm.querySelector('[name="Title"]').value = curRow.data('title');
        curModelObj.TechTitle = c.addCategoryForm.querySelector('[name="TechTitle"]').value = curRow.data('techtitle');
        curModelObj.OrderRank = c.addCategoryForm.querySelector('[name="OrderRank"]').value = curRow.data('order');
        curModelObj.IsPrivate = c.addCategoryForm.querySelector('[name="IsPrivate"]').checked = (curRow.data('isprivate').toLowerCase() == 'true') ? true : false;
        curLink = $(this).data('href');
        $('.error__message').remove();
        isAddCategory = false;
        c.addCategoryHeader.textContent = 'Редактировать категорию';
        c.addCategoryBtn.textContent = 'Изменить';
        c.techTitleInput.classList.add('pointer-none', 'readonly', 'disabled');
    });
    c.createCategoryBtn.addEventListener('click', function () {
        c.addCategoryForm.reset();
        c.addCategoryHeader.textContent = 'Добавить категорию';
        c.addCategoryBtn.textContent = 'Добавить';
        c.techTitleInput.className = 'form-control gui-input';
    });

    // add/edit category
    c.addCategoryBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var sendObj = {
            Title: c.addCategoryForm.querySelector('[name="Title"]').value,
            TechTitle: c.addCategoryForm.querySelector('[name="TechTitle"]').value,
            OrderRank: c.addCategoryForm.querySelector('[name="OrderRank"]').value,
            IsPrivate: c.addCategoryForm.querySelector('[name="IsPrivate"]').checked
        };
        if (isAddCategory) {
            sendPostRequest('#' + c.addCategoryForm.id, c.addCategoryForm.action, sendObj, function () {
                location.reload();
            }, function (data) {
                console.log(data);
            }, 'POST');
        } else {
            sendObj.Id = curModelObj.Id;
            sendPostRequest('#' + c.addCategoryForm.id, c.addCategoryForm.action, sendObj, function (data) {
                location.reload();
            }, function (data) {
                console.log(data);
            }, 'PUT');
        };
    });

    // delete category
    c.deleteCategoryBtn.addEventListener('click', function (e) {
        e.preventDefault();
        let categoryId = c.deleteZoneIdElem
        if (!$(c.checkbox).prop('checked')) {
            errorMessageAdd($('#isPrivate-checkbox'), 'Необходимо подтвердить удаление');
        } else {
            sendPostRequest('#' + c.deleteCategoryForm.id, curLink, { Id: curModelObj.Id }, handleDeleteCategorySuccess, function (data) {
                console.log(data);
            }, 'DELETE');
        }
    });

    function handleDeleteCategorySuccess(data) {
        document.querySelector('[data-category="' + data + '"]').remove();
        $(c.deleteCategoryModalSelector).modal('hide');
        c.deleteCategoryForm.reset();
        if (document.querySelectorAll('.main-list__table-item').length < 1) {
            location.reload();
        }
    }
    
});