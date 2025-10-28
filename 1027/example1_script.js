const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list  = document.getElementById('todo-list');

function createItem(text) {
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-center';
  li.innerHTML = `
    <span class="item-text">${escapeHtml(text)}</span>
    <div class="btn-group">
      <button class="btn btn-sm btn-outline-success" data-action="toggle">完成</button>
      <button class="btn btn-sm btn-outline-danger" data-action="remove">刪除</button>
    </div>
  `;
  return li;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  list.appendChild(createItem(value));
  input.value = '';
  input.focus();
});

input.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    form.requestSubmit();
  }
});

list.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-action]');
  if (!btn || !list.contains(btn)) return; 

  const action = btn.dataset.action;
  const item = btn.closest('li');
  if (!item) return;

  if (action === 'remove') {
    item.remove();
  } else if (action === 'toggle') {
    item.classList.toggle('list-group-item-success');
    const text = item.querySelector('.item-text');
    if (text) text.classList.toggle('done');
    btn.textContent = item.classList.contains('list-group-item-success') ? '復原' : '完成';
  }
});
