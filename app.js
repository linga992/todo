'use strict';

const STORAGE_KEY = 'todo-app.items.v1';
const MAX_LENGTH = 200;

const els = {
  form: document.getElementById('new-form'),
  input: document.getElementById('new-input'),
  list: document.getElementById('list'),
  empty: document.getElementById('empty'),
  summary: document.getElementById('summary'),
  clearDone: document.getElementById('clear-done'),
  filters: Array.from(document.querySelectorAll('.filter')),
};

let items = load();
let filter = 'all';
let draggingId = null;
let idCounter = 0;

/* ---------------- 保存 / 読み込み ---------------- */

function newId() {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

// 壊れた保存データでアプリ全体が起動しなくなるのを避けるため、1件ずつ検証して取り込む。
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((it) => it && typeof it.text === 'string' && it.text.trim() !== '')
      .map((it) => ({
        id: typeof it.id === 'string' ? it.id : newId(),
        text: it.text.slice(0, MAX_LENGTH),
        done: Boolean(it.done),
        createdAt: typeof it.createdAt === 'number' ? it.createdAt : Date.now(),
      }));
  } catch (err) {
    console.warn('保存データを読み込めませんでした:', err);
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('保存に失敗しました:', err);
  }
}

/* ---------------- 操作 ---------------- */

function addItem(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  items.push({
    id: newId(),
    text: trimmed.slice(0, MAX_LENGTH),
    done: false,
    createdAt: Date.now(),
  });
  save();
  render();
  return true;
}

function toggleItem(id) {
  const item = items.find((it) => it.id === id);
  if (!item) return;
  item.done = !item.done;
  save();
  render();
}

// 中身を空にして確定した場合は削除扱いにする。
function updateText(id, text) {
  const trimmed = text.trim();
  if (!trimmed) {
    removeItem(id);
    return;
  }
  const item = items.find((it) => it.id === id);
  if (item) {
    item.text = trimmed.slice(0, MAX_LENGTH);
    save();
  }
  render();
}

function removeItem(id) {
  items = items.filter((it) => it.id !== id);
  save();
  render();
}

function clearDone() {
  const count = items.filter((it) => it.done).length;
  if (count === 0) return;
  if (!window.confirm(`完了済みの ${count} 件を削除します。よろしいですか？`)) return;
  items = items.filter((it) => !it.done);
  save();
  render();
}

/* ---------------- 描画 ---------------- */

function visibleItems() {
  if (filter === 'active') return items.filter((it) => !it.done);
  if (filter === 'done') return items.filter((it) => it.done);
  return items;
}

const EMPTY_MESSAGE = {
  all: 'まだタスクがありません。上の入力欄から追加してください。',
  active: '未完了のタスクはありません。',
  done: '完了したタスクはまだありません。',
};

function render() {
  const shown = visibleItems();
  // 並べ替えは全件表示のときだけ。絞り込み中は隠れた行との前後関係が決まらない。
  const canReorder = filter === 'all' && items.length > 1;

  els.list.textContent = '';
  for (const item of shown) {
    els.list.appendChild(renderItem(item, canReorder));
  }

  els.empty.textContent = EMPTY_MESSAGE[filter];
  els.empty.hidden = shown.length > 0;

  const remaining = items.filter((it) => !it.done).length;
  els.summary.textContent = items.length
    ? `残り ${remaining} 件 / 全 ${items.length} 件`
    : '';
  els.clearDone.disabled = remaining === items.length;
}

function renderItem(item, canReorder) {
  const li = document.createElement('li');
  li.className = item.done ? 'item is-done' : 'item';
  li.dataset.id = item.id;
  if (canReorder) li.draggable = true;

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'check';
  check.checked = item.done;
  check.setAttribute('aria-label', item.done ? '未完了に戻す' : '完了にする');
  check.addEventListener('change', () => toggleItem(item.id));

  // textContent なので、入力に HTML が混ざってもそのまま文字として表示される。
  const text = document.createElement('span');
  text.className = 'text';
  text.textContent = item.text;
  text.title = 'ダブルクリックで編集';
  text.addEventListener('dblclick', () => startEdit(li, item));

  const edit = document.createElement('button');
  edit.type = 'button';
  edit.className = 'icon-btn';
  edit.textContent = '編集';
  edit.addEventListener('click', () => startEdit(li, item));

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'icon-btn icon-btn-danger';
  remove.textContent = '削除';
  remove.addEventListener('click', () => removeItem(item.id));

  li.append(check, text, edit, remove);
  return li;
}

/* ---------------- 編集 ---------------- */

function startEdit(li, item) {
  const text = li.querySelector('.text');
  if (!text) return; // すでに編集中

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = item.text;
  input.maxLength = MAX_LENGTH;
  input.setAttribute('aria-label', 'タスクを編集');
  li.draggable = false;

  // 確定と取り消しは一度だけ。Enter → 再描画で blur が飛んでも二重実行しない。
  let settled = false;
  const commit = () => {
    if (settled) return;
    settled = true;
    updateText(item.id, input.value);
  };
  const cancel = () => {
    if (settled) return;
    settled = true;
    render();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  });
  input.addEventListener('blur', commit);

  text.replaceWith(input);
  input.focus();
  input.select();
}

/* ---------------- 並べ替え ---------------- */
// 描画をやり直すとドラッグ中の要素が DOM から消えて操作が中断されるので、
// ドラッグ中は DOM だけ動かし、dragend で並び順を配列に書き戻す。

els.list.addEventListener('dragstart', (e) => {
  const li = e.target.closest('.item');
  if (!li || !li.draggable) return;
  draggingId = li.dataset.id;
  li.classList.add('is-dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggingId);
});

els.list.addEventListener('dragover', (e) => {
  if (!draggingId) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const dragged = els.list.querySelector('.is-dragging');
  const target = e.target.closest('.item');
  if (!dragged || !target || target === dragged) return;

  const rect = target.getBoundingClientRect();
  const after = e.clientY > rect.top + rect.height / 2;
  els.list.insertBefore(dragged, after ? target.nextSibling : target);
});

els.list.addEventListener('drop', (e) => e.preventDefault());

els.list.addEventListener('dragend', () => {
  const dragged = els.list.querySelector('.is-dragging');
  if (dragged) dragged.classList.remove('is-dragging');
  if (!draggingId) return;
  draggingId = null;

  const byId = new Map(items.map((it) => [it.id, it]));
  const reordered = Array.from(els.list.children)
    .map((li) => byId.get(li.dataset.id))
    .filter(Boolean);

  if (reordered.length === items.length) {
    items = reordered;
    save();
  }
  render();
});

/* ---------------- イベント配線 ---------------- */

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (addItem(els.input.value)) els.input.value = '';
  els.input.focus();
});

// Enter は自前で拾う。IME の変換中（isComposing）の Enter は変換の確定操作なので、
// そこで送信すると変換途中の文字列が登録されてしまう。その場合は何もしない。
els.input.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.isComposing) return;
  e.preventDefault();
  els.form.requestSubmit(); // required の検証を通すため submit() ではなくこちら
});

els.clearDone.addEventListener('click', clearDone);

for (const btn of els.filters) {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    for (const b of els.filters) {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    }
    render();
  });
}

// 同じアプリを別タブでも開いている場合に表示を合わせる。
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY) return;
  items = load();
  render();
});

render();
