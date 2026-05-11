import { describe, it, expect } from 'vitest';
import { authMiddleware } from '../middleware/auth.middleware.js';
import jwt from 'jsonwebtoken';

function mockReq(token) {
  return {
    headers: {
      authorization: token ? `Bearer ${token}` : undefined,
    },
  };
}

function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.body = obj;
    },
  };
}

describe('authMiddleware', () => {
  it('should pass with valid token', () => {
    const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET || 'secret');

    const req = mockReq(token);
    const res = mockRes();
    let nextCalled = false;

    const next = () => {
      nextCalled = true;
    };

    authMiddleware(req, res, next);

    expect(nextCalled).toBe(true);
    expect(req.user.id).toBe('123');
  });

  it('should return 401 without token', () => {
    const req = mockReq(null);
    const res = mockRes();

    const next = () => {};

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
  });
});
