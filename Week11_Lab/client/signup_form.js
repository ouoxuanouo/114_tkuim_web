const form = document.getElementById('signup-form');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  const res = await fetch('http://localhost:3001/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  msg.textContent = res.ok ? '成功: ' + result._id : '失敗: ' + result.error;
});
