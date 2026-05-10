import { API_URL } from '../api.js';

export async function getMyProfile() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить профиль');
  }
  return data;
}

export async function updateMyProfile(profileData) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось обновить профиль');
  }

  return data;
}