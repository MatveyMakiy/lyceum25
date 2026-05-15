import { API_URL } from '../api.js';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
}

function getJsonAuthHeaders() {
  return {
    ...getAuthHeaders(),
    'Content-Type': 'application/json',
  };
}

export async function getAdminStats() {
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить статистику');
  }
  return data;
}

export async function getAdminContent() {
  const response = await fetch(`${API_URL}/admin/content`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить данные админки');
  }
  return data;
}

export async function adminCreatePublicEvent(eventData) {
  const response = await fetch(`${API_URL}/admin/public-events`, {
    method: 'POST',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(eventData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось создать публичное мероприятие');
  }
  return data;
}

export async function adminUpdateUserRole(id, role) {
  const response = await fetch(`${API_URL}/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: getJsonAuthHeaders(),
    body: JSON.stringify({
      role,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось изменить роль пользователя');
  }
  return data;
}

export async function adminDeleteUser(id) {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось удалить пользователя');
  }
  return data;
}

export async function adminDeletePost(id) {
  const response = await fetch(`${API_URL}/admin/posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось удалить пост');
  }
  return data;
}

export async function adminDeleteComment(id) {
  const response = await fetch(`${API_URL}/admin/comments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось удалить комментарий');
  }
  return data;
}

export async function adminDeleteGroup(id) {
  const response = await fetch(`${API_URL}/admin/groups/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось удалить группу');
  }
  return data;
}

export async function adminDeleteEvent(id) {
  const response = await fetch(`${API_URL}/admin/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось удалить мероприятие');
  }
  return data;
}
