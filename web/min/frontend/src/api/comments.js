import { API_URL } from '../api.js';

export async function getPostComments(postId) {
  const response = await fetch(`${API_URL}/posts/${postId}/comments`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить комментарии');
  }
  return data;
}

export async function createComment(postId, content) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      postId,
      content,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось отправить комментарий');
  }
  return data;
}

export async function deleteComment(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/comments/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось удалить комментарий');
  }
  return data;
}