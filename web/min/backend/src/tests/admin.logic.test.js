import { describe, expect, it } from 'vitest';

function canAccessAdminPanel(user) {
  return user?.role === 'admin';
}

function canChangeUserRole(currentUserId, targetUserId, nextRole) {
  if (currentUserId === targetUserId && nextRole !== 'admin') {
    return false;
  }
  return ['user', 'admin'].includes(nextRole);
}

function canDeleteUser(currentUserId, targetUserId) {
  return currentUserId !== targetUserId;
}

function canCreatePublicEvent(user) {
  return user?.role === 'admin';
}

describe('admin logic', () => {
  it('allows admin to access admin panel', () => {
    expect(
      canAccessAdminPanel({
        id: 'user-1',
        role: 'admin',
      }),
    ).toBe(true);
  });
  it('does not allow regular user to access admin panel', () => {
    expect(
      canAccessAdminPanel({
        id: 'user-1',
        role: 'user',
      }),
    ).toBe(false);
  });
  it('does not allow admin to remove admin role from himself', () => {
    expect(canChangeUserRole('user-1', 'user-1', 'user')).toBe(false);
  });
  it('allows admin role to be assigned to another user', () => {
    expect(canChangeUserRole('user-1', 'user-2', 'admin')).toBe(true);
  });
  it('does not allow invalid role', () => {
    expect(canChangeUserRole('user-1', 'user-2', 'superadmin')).toBe(false);
  });
  it('does not allow deleting yourself', () => {
    expect(canDeleteUser('user-1', 'user-1')).toBe(false);
  });
  it('allows deleting another user', () => {
    expect(canDeleteUser('user-1', 'user-2')).toBe(true);
  });
  it('allows admin to create public event', () => {
    expect(
      canCreatePublicEvent({
        id: 'user-1',
        role: 'admin',
      }),
    ).toBe(true);
  });
  it('does not allow regular user to create public event', () => {
    expect(
      canCreatePublicEvent({
        id: 'user-1',
        role: 'user',
      }),
    ).toBe(false);
  });
});
