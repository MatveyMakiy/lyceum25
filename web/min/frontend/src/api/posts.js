import { API_URL } from '../api.js';

export async function getPosts(page = 1, limit = 2) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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