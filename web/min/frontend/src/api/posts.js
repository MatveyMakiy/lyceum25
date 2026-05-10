import { API_URL } from '../api.js';

export async function getPosts(page = 1, limit = 2) {
  const response = await fetch(`${API_URL}/posts`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить посты');
  }

  const normalizedPosts = data.map((post) => ({
    id: post.id,
    author: post.author
      ? `${post.author.firstName} ${post.author.lastName}`
      : 'Неизвестный автор',
    text: post.content,
    date: new Date(post.createdAt).toLocaleString('ru-RU'),
  }));

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    items: normalizedPosts.slice(start, end),
    hasMore: end < normalizedPosts.length,
  };
}

export async function createPost(content) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/posts`, {
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
    throw new Error(data.message || 'Не удалось создать пост');
  }

  return data;
}