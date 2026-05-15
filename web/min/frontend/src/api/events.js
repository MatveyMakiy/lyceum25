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

export async function getEventById(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить мероприятие');
  }
  return data;
}

export async function updateEvent(id, eventData) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось изменить мероприятие');
  }
  return data;
}

export async function deleteEvent(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось удалить мероприятие');
  }
  return data;
}

export async function joinEvent(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events/${id}/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось записаться на мероприятие');
  }
  return data;
}

export async function leaveEvent(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events/${id}/leave`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось отменить запись');
  }
  return data;
}

export async function getFeedEvents(limit = 4) {
  const token = localStorage.getItem('token');
  if (!token) {
    return getPublicEvents(limit);
  }
  const params = new URLSearchParams({
    page: 1,
    limit,
    scope: 'my',
  });
  const response = await fetch(`${API_URL}/events?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить мероприятия');
  }
  return data.items;
}

export async function getPublicEvents(limit = 3) {
  const params = new URLSearchParams({
    limit,
  });
  const response = await fetch(`${API_URL}/public/events?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.message || 'Не удалось загрузить публичные мероприятия',
    );
  }
  return data.items;
}
