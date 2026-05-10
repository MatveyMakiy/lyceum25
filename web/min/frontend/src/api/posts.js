import { API_URL } from '../api.js';

export async function getPosts(page = 1, limit = 2, search = '') {
  const params = new URLSearchParams({
    page,
    limit,
  });
  if (search.trim()) {
    params.set('search', search.trim());
  }
  const response = await fetch(`${API_URL}/posts?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить посты');
  }

  return {
    items: data.items.map((post) => ({
      id: post.id,
      author: post.author
        ? `${post.author.firstName} ${post.author.lastName}`
        : 'Неизвестный автор',
      text: post.content,
      date: new Date(post.createdAt).toLocaleString('ru-RU'),
      group: post.group,
    })),
    hasMore: data.hasMore,
    total: data.total,
  };
}

export async function createPost(content, groupId = null) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      content,
      groupId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Не удалось создать пост');
  }

  return data;
}