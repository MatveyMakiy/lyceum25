import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

vi.mock('../lib/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const prisma = (await import('../lib/prisma.js')).default;
const { register, login } = await import('../controllers/auth.controller.js');

function createResponse() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('auth controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });
  it('registers new user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-password');
    jwt.sign.mockReturnValue('test-token');
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Иван',
      lastName: 'Иванов',
      role: 'user',
      class: null,
      avatarUrl: null,
      bio: null,
      createdAt: new Date('2026-05-15T10:00:00.000Z'),
      updatedAt: new Date('2026-05-15T10:00:00.000Z'),
    });
    const req = {
      body: {
        email: 'test@example.com',
        password: '123456',
        firstName: 'Иван',
        lastName: 'Иванов',
      },
    };
    const res = createResponse();
    await register(req, res);
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
            data: expect.objectContaining({
            email: 'test@example.com',
            passwordHash: 'hashed-password',
            firstName: 'Иван',
            lastName: 'Иванов',
            }),
        }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'test-token',
        user: expect.objectContaining({
          id: 'user-1',
          email: 'test@example.com',
        }),
      }),
    );
  });
  it('does not register without required fields', async () => {
    const req = {
      body: {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      },
    };
    const res = createResponse();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Все поля обязательны',
    });
  });
  it('does not register existing user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    });
    const req = {
      body: {
        email: 'test@example.com',
        password: '123456',
        firstName: 'Иван',
        lastName: 'Иванов',
      },
    };
    const res = createResponse();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Пользователь с такой почтой уже существует',
    });
  });
  it('logs user in', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      firstName: 'Иван',
      lastName: 'Иванов',
      role: 'user',
      class: null,
      avatarUrl: null,
      bio: null,
      createdAt: new Date('2026-05-15T10:00:00.000Z'),
      updatedAt: new Date('2026-05-15T10:00:00.000Z'),
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('test-token');
    const req = {
      body: {
        email: 'test@example.com',
        password: '123456',
      },
    };
    const res = createResponse();
    await login(req, res);
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashed-password');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'test-token',
        user: expect.objectContaining({
          id: 'user-1',
          email: 'test@example.com',
        }),
      }),
    );
  });
  it('does not login without email or password', async () => {
    const req = {
      body: {
        email: '',
        password: '',
      },
    };
    const res = createResponse();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Почта и пароль обязательны',
    });
  });
  it('does not login unknown user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const req = {
      body: {
        email: 'wrong@example.com',
        password: '123456',
      },
    };
    const res = createResponse();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Неверная почта или пароль',
    });
  });
  it('does not login with wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
    });
    bcrypt.compare.mockResolvedValue(false);
    const req = {
      body: {
        email: 'test@example.com',
        password: 'wrong',
      },
    };
    const res = createResponse();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Неверная почта или пароль',
    });
  });
});