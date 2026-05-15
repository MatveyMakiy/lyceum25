import { describe, expect, it } from 'vitest';

function canSeePost(userId, userGroupIds, post) {
  if (post.authorId === userId && post.groupId === null) {
    return true;
  }
  if (post.groupId && userGroupIds.includes(post.groupId)) {
    return true;
  }
  return false;
}

function canSeeEvent(userGroupIds, event) {
  if (event.isPublic) {
    return true;
  }
  if (event.groupId && userGroupIds.includes(event.groupId)) {
    return true;
  }
  return false;
}

describe('feed visibility logic', () => {
  it('shows own personal post', () => {
    expect(
      canSeePost('user-1', [], {
        authorId: 'user-1',
        groupId: null,
      }),
    ).toBe(true);
  });
  it('shows post from joined group', () => {
    expect(
      canSeePost('user-1', ['group-1'], {
        authorId: 'user-2',
        groupId: 'group-1',
      }),
    ).toBe(true);
  });
  it('does not show post from other group', () => {
    expect(
      canSeePost('user-1', ['group-1'], {
        authorId: 'user-2',
        groupId: 'group-2',
      }),
    ).toBe(false);
  });
  it('shows public event', () => {
    expect(
      canSeeEvent([], {
        isPublic: true,
        groupId: null,
      }),
    ).toBe(true);
  });
  it('shows event from joined group', () => {
    expect(
      canSeeEvent(['group-1'], {
        isPublic: false,
        groupId: 'group-1',
      }),
    ).toBe(true);
  });
  it('does not show event from other group', () => {
    expect(
      canSeeEvent(['group-1'], {
        isPublic: false,
        groupId: 'group-2',
      }),
    ).toBe(false);
  });
});
