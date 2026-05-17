import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getMyProfile,
  getUserById,
  getUsers,
  updateMyProfile,
} from '../src/api/users.js';

function mockJsonResponse(data, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('users api', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    vi.restoreAllMocks();
  });
  it('loads my profile', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'user-1',
        firstName: 'Иван',
      }),
    );
    const result = await getMyProfile();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/me'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result.firstName).toBe('Иван');
  });
  it('updates my profile', async () => {
    const profileData = {
      firstName: 'Иван',
      lastName: 'Иванов',
      class: '10-2',
      bio: 'О себе',
    };
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'user-1',
        ...profileData,
      }),
    );
    const result = await updateMyProfile(profileData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/me'),
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(profileData),
      }),
    );
    expect(result.class).toBe('10-2');
  });
  it('loads users with search', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        items: [
          {
            id: 'user-1',
            firstName: 'Иван',
          },
        ],
        total: 1,
      }),
    );
    const result = await getUsers(1, 10, 'Иван');
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/users?');
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
    expect(url).toContain('%D0%98%D0%B2%D0%B0%D0%BD');
    expect(options.headers.Authorization).toBe('Bearer test-token');
    expect(result.total).toBe(1);
  });
  it('loads user by id', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'user-2',
        firstName: 'Пётр',
      }),
    );
    const result = await getUserById('user-2');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/user-2'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(result.firstName).toBe('Пётр');
  });
  it('throws server error', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse(
        {
          message: 'Пользователь не найден',
        },
        false,
      ),
    );
    await expect(getUserById('bad-id')).rejects.toThrow(
      'Пользователь не найден',
    );
  });
});
