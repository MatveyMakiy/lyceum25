import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPosts } from '../src/api/posts.js';

function mockJsonResponse(data, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('posts api', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  it('returns posts', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        items: [
          {
            id: 'post-1',
            content: 'Тестовый пост',
            createdAt: '2026-05-15T10:00:00.000Z',
            author: {
              id: 'user-1',
              firstName: 'Иван',
              lastName: 'Иванов',
            },
            group: null,
            _count: {
              likes: 0,
            },
          },
        ],
        total: 1,
        hasMore: false,
      }),
    );
    const result = await getPosts();
    expect(fetch).toHaveBeenCalledOnce();
    expect(result.total).toBe(1);
    expect(result.hasMore).toBe(false);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'post-1',
      authorId: 'user-1',
      author: 'Иван Иванов',
      text: 'Тестовый пост',
      likesCount: 0,
    });
  });
});
