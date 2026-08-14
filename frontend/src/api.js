async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const getBoard = (boardId = 1) => request(`/api/boards/${boardId}`);
export const createTask = (task) => request('/api/tasks', { method: 'POST', body: JSON.stringify(task) });
export const updateTask = (id, task) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) });
export const deleteTask = (id) => request(`/api/tasks/${id}`, { method: 'DELETE' });
export const moveTask = (id, columnId) => request(`/api/tasks/${id}/move`, { method: 'PATCH', body: JSON.stringify({ columnId }) });
