const form = document.getElementById('dynamic-form');
const list = document.getElementById('participant-list');
const addBtn = document.getElementById('add-participant');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const exportBtn = document.getElementById('export-btn');
const countLabel = document.getElementById('count');

const maxParticipants = 5;
let participantIndex = 0;
const STORAGE_KEY = 'practice6_participants';

function createParticipantCard() {
  const index = participantIndex++;
  const wrapper = document.createElement('div');
  wrapper.className = 'participant card border-0 shadow-sm';
  wrapper.dataset.index = index;
  wrapper.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <h5 class="card-title mb-0">參與者 ${index + 1}</h5>
        <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove">移除</button>
      </div>
      <div class="mb-3">
        <label class="form-label" for="name-${index}">姓名</label>
        <input id="name-${index}" name="name-${index}" class="form-control" type="text" required aria-describedby="name-${index}-error">
        <p id="name-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
      <div class="mb-0">
        <label class="form-label" for="email-${index}">Email</label>
        <input id="email-${index}" name="email-${index}" class="form-control" type="email" required aria-describedby="email-${index}-error" inputmode="email">
        <p id="email-${index}-error" class="text-danger small mb-0" aria-live="polite"></p>
      </div>
    </div>
  `;
  return wrapper;
}

function updateCount() {
  countLabel.textContent = list.children.length;
  addBtn.disabled = list.children.length >= maxParticipants;
}

function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  input.setCustomValidity(message);
  error.textContent = message;
  if (message) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }
}

function validateInput(input) {
  const value = input.value.trim();
  if (!value) {
    setError(input, '此欄位必填');
    return false;
  }
  if (input.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      setError(input, 'Email 格式不正確');
      return false;
    }
  }
  setError(input, '');
  return true;
}

function handleAddParticipant(prefill = null) {
  if (list.children.length >= maxParticipants) return;
  const participant = createParticipantCard();
  list.appendChild(participant);
  updateCount();

  if (prefill && typeof prefill === 'object') {
    const nameInput = participant.querySelector(`#name-${participant.dataset.index}`);
    const emailInput = participant.querySelector(`#email-${participant.dataset.index}`);
    if (nameInput) nameInput.value = prefill.name ?? '';
    if (emailInput) emailInput.value = prefill.email ?? '';
  }

  participant.querySelector('input')?.focus();
  saveToLocal();
}

addBtn.addEventListener('click', () => handleAddParticipant());

list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="remove"]');
  if (!button) return;
  const participant = button.closest('.participant');
  participant?.remove();
  renumberTitles();
  updateCount();
  saveToLocal();
});

list.addEventListener('blur', (event) => {
  if (event.target.matches('input')) {
    validateInput(event.target);
    saveToLocal();
  }
}, true);

list.addEventListener('input', (event) => {
  if (event.target.matches('input')) {
    if (event.target.validationMessage) {
      validateInput(event.target);
    }
    saveToLocal();
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (list.children.length === 0) {
    alert('請至少新增一位參與者');
    handleAddParticipant();
    return;
  }

  let firstInvalid = null;
  list.querySelectorAll('input').forEach((input) => {
    const valid = validateInput(input);
    if (!valid && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';
  await new Promise((resolve) => setTimeout(resolve, 1000));

  alert('表單已送出！');
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  updateCount();
  submitBtn.disabled = false;
  submitBtn.textContent = '送出';
  clearLocal();
});

resetBtn.addEventListener('click', () => {
  form.reset();
  list.innerHTML = '';
  participantIndex = 0;
  updateCount();
  clearLocal();
});

exportBtn.addEventListener('click', () => {
  const data = serializeParticipants();
  if (data.length === 0) {
    alert('目前沒有參與者可以匯出。');
    return;
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  a.download = `participants-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

function serializeParticipants() {
  const arr = [];
  list.querySelectorAll('.participant').forEach((card) => {
    const idx = card.dataset.index;
    const name = document.getElementById(`name-${idx}`)?.value?.trim() ?? '';
    const email = document.getElementById(`email-${idx}`)?.value?.trim() ?? '';
    if (name || email) {
      arr.push({ name, email });
    }
  });
  return arr;
}

function saveToLocal() {
  const data = serializeParticipants();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ participantIndex, data }));
}

function loadFromLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    list.innerHTML = '';
    participantIndex = 0;
    (parsed.data || []).forEach((p) => handleAddParticipant(p));
    if (typeof parsed.participantIndex === 'number' && parsed.participantIndex > participantIndex) {
      participantIndex = parsed.participantIndex;
    }
    renumberTitles();
    updateCount();
  } catch {
  }
}

function clearLocal() {
  localStorage.removeItem(STORAGE_KEY);
}

function renumberTitles() {
  list.querySelectorAll('.participant').forEach((card, i) => {
    const title = card.querySelector('.card-title');
    if (title) title.textContent = `參與者 ${i + 1}`;
  });
}

loadFromLocal();
if (list.children.length === 0) {
  handleAddParticipant();
}
updateCount();