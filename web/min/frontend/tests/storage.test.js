import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCurrentUser,
  removeCurrentUser,
  saveCurrentUser,
} from '../src/utils/storage.js';

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('saves and returns current user', () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Тест',
      lastName: 'Тестов',
      role: 'user',
    };
    saveCurrentUser(user);
    expect(getCurrentUser()).toEqual(user);
  });
  it('returns null if current user is not saved', () => {
    expect(getCurrentUser()).toBeNull();
  });
  it('removes current user', () => {
    saveCurrentUser({
      id: 'user-1',
      email: 'test@example.com',
    });
    removeCurrentUser();
    expect(getCurrentUser()).toBeNull();
  });
});