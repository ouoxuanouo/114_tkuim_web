const form = document.getElementById('contact-form');
const email = document.getElementById('email');
const phone = document.getElementById('phone');

function showValidity(input) {
  if (input.validity.valueMissing) {
    input.setCustomValidity('這個欄位必填');
  } else if (input.validity.typeMismatch) {
    input.setCustomValidity('格式不正確，請確認輸入內容');
  } else if (input.validity.patternMismatch) {
    input.setCustomValidity(input.title || '格式不正確');
  } else {
    input.setCustomValidity('');
  }
  return input.reportValidity();
}

email.addEventListener('input', () => {
  const value = email.value.trim();
  if (value && !value.endsWith('@o365.tku.edu.tw')) {
    email.setCustomValidity('請使用 @o365.tku.edu.tw 結尾的 Email');
  } else {
    email.setCustomValidity('');
  }
  email.reportValidity();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const emailValue = email.value.trim();
  if (!emailValue.endsWith('@o365.tku.edu.tw')) {
    email.setCustomValidity('請使用 @o365.tku.edu.tw 結尾的 Email');
    email.reportValidity();
    return;
  } else {
    email.setCustomValidity('');
  }

  const emailOk = showValidity(email);
  const phoneOk = showValidity(phone);
  if (emailOk && phoneOk) {
    alert('表單驗證成功，準備送出資料');
    form.reset();
  }
});

phone.addEventListener('blur', () => {
  showValidity(phone);
});