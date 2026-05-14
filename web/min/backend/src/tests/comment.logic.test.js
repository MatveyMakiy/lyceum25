import { describe, expect, it } from 'vitest';

function canDeleteComment(currentUserId, commentAuthorId) {
  return currentUserId === commentAuthorId;
}

function isValidComment(content) {
  return Boolean(content && content.trim());
}

describe('comments logic', () => {
  it('allows author to delete own comment', () => {
    expect(canDeleteComment('user-1', 'user-1')).toBe(true);
  });
  it('does not allow deleting another user comment', () => {
    expect(canDeleteComment('user-1', 'user-2')).toBe(false);
  });
  it('does not allow empty comment', () => {
    expect(isValidComment('   ')).toBe(false);
  });
  it('allows non-empty comment', () => {
    expect(isValidComment('Нормальный комментарий')).toBe(true);
  });
});