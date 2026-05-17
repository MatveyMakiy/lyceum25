import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createComment,
  deleteComment,
  getPostComments,
} from '../src/api/comments.js';

function mockJsonResponse(data, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('comments api', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    vi.restoreAllMocks();
  });
  it('loads post comments without auth header', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse([
        {
          id: 'comment-1',
          content: 'Комментарий',
        },
      ]),
    );
    const result = await getPostComments('post-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts/post-1/comments'),
    );
    expect(result[0].content).toBe('Комментарий');
  });
  it('creates comment', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'comment-1',
        content: 'Комментарий',
      }),
    );
    const result = await createComment('post-1', 'Комментарий');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/comments'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          postId: 'post-1',
          content: 'Комментарий',
        }),
      }),
    );
    expect(result.id).toBe('comment-1');
  });
  it('deletes comment', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        message: 'Комментарий удалён',
      }),
    );
    const result = await deleteComment('comment-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/comments/comment-1'),
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result.message).toBe('Комментарий удалён');
  });
  it('throws server error', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse(
        {
          message: 'Комментарий не найден',
        },
        false,
      ),
    );
    await expect(deleteComment('bad-id')).rejects.toThrow(
      'Комментарий не найден',
    );
  });
});