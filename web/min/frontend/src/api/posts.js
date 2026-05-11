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
      authorId: post.author?.id || null,
      author: post.author
        ? `${post.author.firstName} ${post.author.lastName}`
        : 'Неизвестный автор',
      text: post.content,
      date: new Date(post.createdAt).toLocaleString('ru-RU'),
      group: post.group,
      likesCount: post._count?.likes || 0,
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

export async function updatePost(id, content) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'PUT',
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
    throw new Error(data.message || 'Не удалось изменить пост');
  }
  return data;
}

export async function deletePost(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось удалить пост');
  }
  return data;
}

export async function getPostById(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/posts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось загрузить пост');
  }
  return data;
}

export async function togglePostLike(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/posts/${id}/like`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Не удалось поставить лайк');
  }
  return data;
}