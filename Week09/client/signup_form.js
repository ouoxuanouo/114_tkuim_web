const form = document.querySelector('#signup-form');
const resultEl = document.querySelector('#result');
const submitBtn = document.querySelector('#submit-btn');
const loadListBtn = document.querySelector('#load-list-btn');

const API_BASE = 'http://localhost:3001/api/signup';

// 共用：呼叫報名 API（POST）
async function submitSignup(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || '報名失敗');
  }
  return payload;
}

// 共用：讀取清單（GET）
async function fetchSignupList() {
  const res = await fetch(API_BASE);
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || '取得清單失敗');
  }
  return payload;
}

// 送出表單
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  // Week07 原本有的欄位這邊先 mock
  payload.password = payload.confirmPassword = 'demoPass88';
  payload.interests = ['後端入門'];
  payload.terms = true;

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = '送出中...';
    resultEl.textContent = '送出中...';

    const result = await submitSignup(payload);

    resultEl.textContent = JSON.stringify(result, null, 2);
    form.reset();
  } catch (error) {
    resultEl.textContent = `錯誤：${error.message}`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '送出';
  }
});

// 查看報名清單按鈕
loadListBtn.addEventListener('click', async () => {
  try {
    resultEl.textContent = '載入中...';
    const list = await fetchSignupList();
    resultEl.textContent = JSON.stringify(list, null, 2);
  } catch (error) {
    resultEl.textContent = `錯誤：${error.message}`;
  }
});
