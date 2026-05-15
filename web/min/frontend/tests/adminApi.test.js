import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminCreatePublicEvent,
  adminDeleteComment,
  adminDeleteEvent,
  adminDeleteGroup,
  adminDeletePost,
  adminDeleteUser,
  adminUpdateUserRole,
  getAdminContent,
  getAdminStats,
} from '../src/api/admin.js';

function mockJsonResponse(data, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('admin api', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  it('loads admin stats', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        usersCount: 2,
        groupsCount: 1,
        postsCount: 3,
        commentsCount: 4,
        eventsCount: 5,
        chatsCount: 6,
      }),
    );
    const result = await getAdminStats();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/stats'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result.usersCount).toBe(2);
    expect(result.chatsCount).toBe(6);
  });
  it('loads admin content', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        users: [],
        posts: [],
        comments: [],
        groups: [],
        events: [],
      }),
    );
    const result = await getAdminContent();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/content'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result.users).toEqual([]);
    expect(result.events).toEqual([]);
  });
  it('creates public event', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'event-1',
        title: 'Публичное мероприятие',
        isPublic: true,
      }),
    );
    const result = await adminCreatePublicEvent({
      title: 'Публичное мероприятие',
      description: 'Описание',
      startTime: '2026-05-20T10:00',
      endTime: '',
      location: 'Лицей',
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/public-events'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
      }),
    );
    expect(result.isPublic).toBe(true);
  });
  it('updates user role', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'user-1',
        role: 'admin',
      }),
    );
    const result = await adminUpdateUserRole('user-1', 'admin');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users/user-1/role'),
      expect.objectContaining({
        method: 'PATCH',
      }),
    );
    expect(result.role).toBe('admin');
  });
  it('deletes user', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        message: 'Пользователь удалён',
      }),
    );
    const result = await adminDeleteUser('user-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users/user-1'),
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
    expect(result.message).toBe('Пользователь удалён');
  });
  it('deletes post, comment, group and event', async () => {
    localStorage.setItem('token', 'test-token');
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        message: 'Удалено',
      }),
    );
    await adminDeletePost('post-1');
    await adminDeleteComment('comment-1');
    await adminDeleteGroup('group-1');
    await adminDeleteEvent('event-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/posts/post-1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/comments/comment-1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/groups/group-1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/events/event-1'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
  it('throws server error message', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse(
        {
          message: 'Доступ только для администратора',
        },
        false,
      ),
    );
    await expect(getAdminStats()).rejects.toThrow(
      'Доступ только для администратора',
    );
  });
});