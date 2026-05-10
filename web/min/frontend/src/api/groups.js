import { API_URL } from '../api.js';

export async function getGroups(page = 1, limit = 6, search = '') {
  const token = localStorage.getItem('token');

  const params = new URLSearchParams({
    page,
    limit,
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }

  const response = await fetch(`${API_URL}/groups?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить группы');
  }

  return data;
}

export async function createGroup({ name, description }) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      description,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось создать группу');
  }

  return data;
}

export async function getGroupById(id) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/groups/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить группу');
  }

  return data;
}

export async function joinGroup(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/groups/${id}/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось вступить в группу');
  }
  return data;
}
export async function leaveGroup(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/groups/${id}/leave`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось выйти из группы');
  }
  return data;
}