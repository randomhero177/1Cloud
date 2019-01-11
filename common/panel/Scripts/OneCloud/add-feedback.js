let formSelector = '#feedback-form';
let form = document.querySelector(formSelector);
let btn = form.querySelector('[type="submit"]');

form.addEventListener('submit', sendFeedback);
btn.addEventListener('click', sendFeedback);

function sendFeedback(e) {
  e.preventDefault();
  e.stopPropagation();

  let feedback = getFeedbackObj();
  let errors = 0;

  for (let name in feedback) {
    if (feedback[name] === '') {
      errorMessageAdd($('[name="' + name + '"]'), resources.Required);
      errors++;
    }
    if (window.util.checkIfHtml(feedback[name])) {
      errorMessageAdd($('[name="' + name + '"]'), resources.HtmlTagNotAvaliable);
      errors++;
    }
  }
  if (errors > 0) {
    return;
  }

  sendAjaxRequest(formSelector, form.action, feedback);
}
function getFeedbackObj() {
  return {
    CustomerCompanyName: form.querySelector('[name="CustomerCompanyName"]').value,
    CustomerJob: form.querySelector('[name="CustomerJob"]').value,
    CustomerFirstName: form.querySelector('[name="CustomerFirstName"]').value,
    CustomerLastName: form.querySelector('[name="CustomerLastName"]').value,
    Description: form.querySelector('[name="Description"]').value
  }
}