import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

describe('JWT', () => {
  it('should generate token', () => {
    const token = jwt.sign({ id: 1 }, 'secret');
    expect(typeof token).toBe('string');
  });

  it('should verify token', () => {
    const token = jwt.sign({ id: 1 }, 'secret');
    const decoded = jwt.verify(token, 'secret');

    expect(decoded.id).toBe(1);
  });
});
