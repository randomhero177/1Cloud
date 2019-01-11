(function initSnapshots() {
  var createSnapshotForm = document.querySelector('#server-create-snapshot');
  var deleteSnapshotForm = document.querySelector('#server-delete-snapshot');

  if (createSnapshotForm !== null) {
    createSnapshotForm.addEventListener('submit', createSnapshot);
  }

  if (deleteSnapshotForm !== null) {
    deleteSnapshotForm.addEventListener('submit', deleteSnapshot);
  }

  function createSnapshot(e) {
    e.preventDefault();
    var nameField = createSnapshotForm.querySelector('[name="SnapshotName"]');

    if (nameField.value === '') {
      errorMessageAdd($(nameField), resources.Shared_Required);
      return;
    }

    sendAjaxRequest('#' + createSnapshotForm.id, createSnapshotForm.action, {
      ServiceInstanceId: createSnapshotForm.querySelector('[name="ServiceInstanceId"]').value,
      SnapshotName: nameField.value
    });
  }

  function deleteSnapshot(e) {
    e.preventDefault();

    sendAjaxRequest('#' + deleteSnapshotForm.id, deleteSnapshotForm.action, {
      snapshotId: deleteSnapshotForm.querySelector('[name="snapshotId"]').value,
      serviceInstanceId: deleteSnapshotForm.querySelector('[name="serviceInstanceId"]').value
    });
  }
})();