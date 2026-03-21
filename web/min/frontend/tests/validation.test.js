import { describe, expect, it } from 'vitest';
import { validateEmail, validatePassword } from '../src/utils/validation.js';

describe('validation', () => {
  it('checks email correctly', () => {
    expect(validateEmail('test@mail.com')).toBe(true);
    expect(validateEmail('wrong-email')).toBe(false);
  });

  it('checks password length', () => {
    expect(validatePassword('12345678')).toBe(true);
    expect(validatePassword('123')).toBe(false);
  });
});
