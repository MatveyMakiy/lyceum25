import { API_URL } from '../api.js';

export async function getChats() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/chats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить чаты');
  }
  return data;
}

export async function createDirectChat(userId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/chats/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось создать чат');
  }
  return data;
}

export async function getChatById(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/chats/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить чат');
  }
  return data;
}

export async function sendChatMessage(chatId, content) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось отправить сообщение');
  }
  return data;
}

export async function getOrCreateGroupChat(groupId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/groups/${groupId}/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось открыть чат группы');
  }
  return data;
}
