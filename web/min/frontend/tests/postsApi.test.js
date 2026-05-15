import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPosts, togglePostLike } from '../src/api/posts.js';

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
  it('loads posts with authorization header and maps response', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        items: [
          {
            id: 'post-1',
            content: 'Текст поста',
            createdAt: '2026-05-15T10:00:00.000Z',
            author: {
              id: 'user-1',
              firstName: 'Иван',
              lastName: 'Иванов',
            },
            group: {
              id: 'group-1',
              name: 'Шахматы',
            },
            _count: {
              likes: 2,
            },
          },
        ],
        total: 1,
        hasMore: false,
      }),
    );
    const result = await getPosts(1, 2, 'шахматы');
    expect(fetch).toHaveBeenCalledOnce();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/posts?');
    expect(url).toContain('page=1');
    expect(url).toContain('limit=2');
    expect(url).toContain('%D1%88%D0%B0%D1%85%D0%BC%D0%B0%D1%82%D1%8B');
    expect(options.headers.Authorization).toBe('Bearer test-token');
    expect(result.total).toBe(1);
    expect(result.hasMore).toBe(false);
    expect(result.items[0]).toMatchObject({
      id: 'post-1',
      authorId: 'user-1',
      author: 'Иван Иванов',
      text: 'Текст поста',
      group: {
        id: 'group-1',
        name: 'Шахматы',
      },
      likesCount: 2,
    });
  });
  it('throws server error message on posts loading fail', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse(
        {
          message: 'Ошибка доступа',
        },
        false,
      ),
    );
    await expect(getPosts()).rejects.toThrow('Ошибка доступа');
  });
  it('toggles post like', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        liked: true,
        likesCount: 1,
      }),
    );
    const result = await togglePostLike('post-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-1/like'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result).toEqual({
      liked: true,
      likesCount: 1,
    });
  });
});
