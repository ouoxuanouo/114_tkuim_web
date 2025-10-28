const form = document.getElementById('access-form');
const fields = [
  { input: document.getElementById('name'), error: document.getElementById('name-error') },
  { input: document.getElementById('age'),  error: document.getElementById('age-error')  }
];

function setAriaInvalid(input, isInvalid) {
  if (isInvalid) {
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.removeAttribute('aria-invalid');
  }
}

function validateField(field) {
  const { input, error } = field;
  let message = '';

  if (input.validity.valueMissing) {
    message = '此欄位為必填。';
  } else if (input.id === 'age') {
    const val = Number(input.value);

    if (Number.isFinite(val) && val < Number(input.min)) {
      message = '需年滿 18 歲以上才能填寫。';
    } else if (Number.isFinite(val) && val > Number(input.max)) {
      message = `請輸入不超過 ${input.max} 的數字。`;
    }
  } else {
    if (input.validity.rangeUnderflow || input.validity.rangeOverflow) {
      message = `請輸入 ${input.min} 到 ${input.max} 之間的數字。`;
    }
  }

  input.setCustomValidity(message);
  error.textContent = message;
  setAriaInvalid(input, !!message);

  return !message;
}

fields.forEach((field) => {
  field.input.addEventListener('input', () => {
    if (field.input.validationMessage) {
      validateField(field);
    }
  });
  field.input.addEventListener('blur', () => {
    validateField(field);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  let firstInvalid = null;

  fields.forEach((field) => {
    const isValid = validateField(field);
    if (!isValid && !firstInvalid) {
      firstInvalid = field.input;
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  alert('表單送出成功');
  form.reset();
  fields.forEach(({ error, input }) => {
    error.textContent = '';
    setAriaInvalid(input, false);
    input.setCustomValidity('');
  });
});

