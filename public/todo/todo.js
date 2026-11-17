class TodoApi {
  constructor(baseUrl = '/api/v1/todos') {
    this.baseUrl = baseUrl;
  }

  async request(path = '', options = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    if (res.status === 204) {
      return null;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'リクエストに失敗しました');
    }
    return data;
  }

  async list() {
    const data = await this.request();
    return Array.isArray(data.todos) ? data.todos : [];
  }

  async create(title) {
    const data = await this.request('', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    return data.todo;
  }

  async updateCompletion(id, isCompleted) {
    const data = await this.request(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted }),
    });
    return data.todo;
  }

  async remove(id) {
    await this.request(`/${id}`, {
      method: 'DELETE',
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const api = new TodoApi();
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const submitBtn = document.getElementById('todo-submit');
  const listEl = document.getElementById('todo-list');
  const countEl = document.getElementById('todo-count');
  const errorBanner = document.getElementById('error-banner');

  let todos = [];

  function showError(message) {
    errorBanner.textContent = message;
    errorBanner.classList.add('is-visible');
  }

  function clearError() {
    errorBanner.textContent = '';
    errorBanner.classList.remove('is-visible');
  }

  function renderTodos() {
    listEl.innerHTML = '';
    const completedCount = todos.filter((todo) => todo.isCompleted).length;
    countEl.textContent = `${todos.length} 件（完了 ${completedCount}）`;

    if (todos.length === 0) {
      const emptyEl = document.createElement('li');
      emptyEl.className = 'empty-state';
      emptyEl.textContent = 'タスクはまだありません';
      listEl.appendChild(emptyEl);
      return;
    }

    for (const todo of todos) {
      const item = document.createElement('li');
      item.className = `todo-item${todo.isCompleted ? ' is-completed' : ''}`;

      const label = document.createElement('label');
      label.className = 'todo-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.isCompleted;
      checkbox.addEventListener('change', async () => {
        clearError();
        try {
          const updated = await api.updateCompletion(todo.id, checkbox.checked);
          todos = todos.map((t) => (t.id === todo.id ? updated : t));
          renderTodos();
        } catch (err) {
          showError(err instanceof Error ? err.message : '通信エラーが発生しました');
          await loadTodos();
        }
      });

      const titleSpan = document.createElement('span');
      titleSpan.className = 'todo-title';
      titleSpan.textContent = todo.title;

      label.appendChild(checkbox);
      label.appendChild(titleSpan);

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '削除';
      deleteBtn.addEventListener('click', async () => {
        clearError();
        try {
          await api.remove(todo.id);
          todos = todos.filter((t) => t.id !== todo.id);
          renderTodos();
        } catch (err) {
          showError(err instanceof Error ? err.message : '通信エラーが発生しました');
        }
      });

      item.appendChild(label);
      item.appendChild(deleteBtn);
      listEl.appendChild(item);
    }
  }

  async function loadTodos() {
    clearError();
    try {
      todos = await api.list();
      renderTodos();
    } catch (err) {
      showError(err instanceof Error ? err.message : '通信エラーが発生しました');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (title.length < 1 || title.length > 100) {
      showError('タイトルは1〜100文字で入力してください');
      return;
    }

    clearError();
    submitBtn.disabled = true;
    try {
      const created = await api.create(title);
      todos.unshift(created);
      input.value = '';
      renderTodos();
    } catch (err) {
      showError(err instanceof Error ? err.message : '通信エラーが発生しました');
    } finally {
      submitBtn.disabled = false;
    }
  });

  loadTodos();
});
