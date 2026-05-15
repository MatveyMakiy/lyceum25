import { API_URL } from '../api.js';

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Неверная почта или пароль');
  }

  localStorage.setItem('token', data.token);

  return data.user;
}

export async function registerUser(newUser) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newUser),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка регистрации');
  }

  return data;
}
