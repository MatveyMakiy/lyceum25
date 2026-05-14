import { describe, expect, it } from 'vitest';

function canCreateDirectChat(currentUserId, targetUserId) {
  return currentUserId !== targetUserId;
}

function canOpenGroupChat(isGroupMember) {
  return isGroupMember;
}

function isValidMessage(content) {
  return Boolean(content && content.trim());
}

function getDirectChatTitle(currentUserId, members) {
  const otherMembers = members.filter((user) => user.id !== currentUserId);
  if (otherMembers.length === 0) {
    return 'Избранное';
  }
  return otherMembers
    .map((user) => `${user.firstName} ${user.lastName}`)
    .join(', ');
}

describe('chats logic', () => {
  it('does not allow creating direct chat with yourself', () => {
    expect(canCreateDirectChat('user-1', 'user-1')).toBe(false);
  });
  it('allows creating direct chat with another user', () => {
    expect(canCreateDirectChat('user-1', 'user-2')).toBe(true);
  });
  it('allows group chat only for group members', () => {
    expect(canOpenGroupChat(true)).toBe(true);
    expect(canOpenGroupChat(false)).toBe(false);
  });
  it('does not allow empty message', () => {
    expect(isValidMessage('   ')).toBe(false);
  });
  it('creates direct chat title from another member', () => {
    const title = getDirectChatTitle('user-1', [
      {
        id: 'user-1',
        firstName: 'Иван',
        lastName: 'Иванов',
      },
      {
        id: 'user-2',
        firstName: 'Пётр',
        lastName: 'Петров',
      },
    ]);
    expect(title).toBe('Пётр Петров');
  });
});