import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loginUser, registerUser } from '../src/api/auth.js';

function mockJsonResponse(data, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  });
}

describe('auth api', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  it('logs user in and saves token', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        token: 'test-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'Иван',
          lastName: 'Иванов',
        },
      }),
    );
    const user = await loginUser('test@example.com', '123456');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(user.email).toBe('test@example.com');
  });
  it('throws login error message', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse(
        {
          message: 'Неверная почта или пароль',
        },
        false,
      ),
    );
    await expect(loginUser('wrong@example.com', '123')).rejects.toThrow(
      'Неверная почта или пароль',
    );
  });
  it('registers user', async () => {
    const newUser = {
      email: 'new@example.com',
      password: '123456',
      firstName: 'Пётр',
      lastName: 'Петров',
    };
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse({
        id: 'user-2',
        ...newUser,
      }),
    );
    const result = await registerUser(newUser);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/register'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      }),
    );
    expect(result.email).toBe('new@example.com');
  });
  it('throws register error message', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      await mockJsonResponse(
        {
          message: 'Пользователь уже существует',
        },
        false,
      ),
    );
    await expect(
      registerUser({
        email: 'test@example.com',
      }),
    ).rejects.toThrow('Пользователь уже существует');
  });
});
