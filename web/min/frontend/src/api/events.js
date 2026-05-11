import { API_URL } from '../api.js';

export async function getEvents(page = 1, limit = 6, search = '') {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({
    page,
    limit,
  });
  if (search.trim()) {
    params.set('search', search.trim());
  }
  const response = await fetch(`${API_URL}/events?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить мероприятия');
  }
  return data;
}

export async function createEvent(eventData) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось создать мероприятие');
  }
  return data;
}