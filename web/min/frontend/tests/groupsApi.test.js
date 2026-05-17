import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createGroup,
  getGroupById,
  getGroupMembers,
  getGroups,
  joinGroup,
  leaveGroup,
  updateGroup,
  updateGroupMemberRole,
} from '../src/api/groups.js';

function mockJsonResponse(data, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('groups api', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    vi.restoreAllMocks();
  });
  it('loads groups with search params', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        items: [],
        total: 0,
        hasMore: false,
      }),
    );
    const result = await getGroups(2, 6, 'шахматы');
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/groups?');
    expect(url).toContain('page=2');
    expect(url).toContain('limit=6');
    expect(url).toContain('%D1%88%D0%B0%D1%85%D0%BC%D0%B0%D1%82%D1%8B');
    expect(options.headers.Authorization).toBe('Bearer test-token');
    expect(result.total).toBe(0);
  });
  it('creates group', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'group-1',
        name: 'Группа',
      }),
    );
    const result = await createGroup({
      name: 'Группа',
      description: 'Описание',
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/groups'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result.name).toBe('Группа');
  });
  it('loads group by id', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'group-1',
        name: 'Группа',
      }),
    );
    const result = await getGroupById('group-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/groups/group-1'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result.id).toBe('group-1');
  });
  it('joins and leaves group', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        message: 'ok',
      }),
    );
    await joinGroup('group-1');
    await leaveGroup('group-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/groups/group-1/join'),
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/groups/group-1/leave'),
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });
  it('loads group members', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse([
        {
          role: 'admin',
          user: {
            id: 'user-1',
          },
        },
      ]),
    );
    const result = await getGroupMembers('group-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/groups/group-1/members'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result[0].role).toBe('admin');
  });
  it('updates member role', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        role: 'moderator',
      }),
    );
    const result = await updateGroupMemberRole(
      'group-1',
      'user-1',
      'moderator',
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/groups/group-1/members/user-1/role'),
      expect.objectContaining({
        method: 'PATCH',
      }),
    );
    expect(result.role).toBe('moderator');
  });
  it('updates group', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'group-1',
        name: 'Новое название',
      }),
    );
    const result = await updateGroup('group-1', {
      name: 'Новое название',
      description: 'Новое описание',
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/groups/group-1'),
      expect.objectContaining({
        method: 'PUT',
      }),
    );
    expect(result.name).toBe('Новое название');
  });
  it('throws server error', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse(
        {
          message: 'Группа не найдена',
        },
        false,
      ),
    );
    await expect(getGroupById('bad-id')).rejects.toThrow('Группа не найдена');
  });
});