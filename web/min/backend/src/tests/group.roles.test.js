import { describe, expect, it } from 'vitest';

function canCreateGroupPost(role) {
  return ['admin', 'moderator'].includes(role);
}

function canManageGroupMember(viewerRole, targetRole) {
  if (viewerRole !== 'admin') {
    return false;
  }
  if (targetRole === 'admin') {
    return false;
  }
  return true;
}

describe('group roles logic', () => {
  it('allows admin to create group posts', () => {
    expect(canCreateGroupPost('admin')).toBe(true);
  });
  it('allows moderator to create group posts', () => {
    expect(canCreateGroupPost('moderator')).toBe(true);
  });
  it('does not allow regular member to create group posts', () => {
    expect(canCreateGroupPost('member')).toBe(false);
  });
  it('allows admin to manage regular members', () => {
    expect(canManageGroupMember('admin', 'member')).toBe(true);
  });
  it('does not allow admin role to be changed', () => {
    expect(canManageGroupMember('admin', 'admin')).toBe(false);
  });
  it('does not allow moderator to manage members', () => {
    expect(canManageGroupMember('moderator', 'member')).toBe(false);
  });
});
