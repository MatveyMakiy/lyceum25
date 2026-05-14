import { describe, expect, it } from 'vitest';

function canCreateEvent(role) {
  return ['admin', 'moderator'].includes(role);
}

function canManageEvent(currentUserId, eventCreatorId, groupRole) {
  if (currentUserId === eventCreatorId) {
    return true;
  }
  return ['admin', 'moderator'].includes(groupRole);
}

function toggleEventParticipation(isParticipating, participantsCount) {
  if (isParticipating) {
    return {
      isParticipating: false,
      participantsCount: participantsCount - 1,
    };
  }
  return {
    isParticipating: true,
    participantsCount: participantsCount + 1,
  };
}

describe('events logic', () => {
  it('allows admin to create event', () => {
    expect(canCreateEvent('admin')).toBe(true);
  });
  it('allows moderator to create event', () => {
    expect(canCreateEvent('moderator')).toBe(true);
  });
  it('does not allow regular member to create event', () => {
    expect(canCreateEvent('member')).toBe(false);
  });
  it('allows event creator to manage event', () => {
    expect(canManageEvent('user-1', 'user-1', 'member')).toBe(true);
  });
  it('allows group moderator to manage event', () => {
    expect(canManageEvent('user-2', 'user-1', 'moderator')).toBe(true);
  });
  it('adds event participant', () => {
    const result = toggleEventParticipation(false, 2);
    expect(result.isParticipating).toBe(true);
    expect(result.participantsCount).toBe(3);
  });
  it('removes event participant', () => {
    const result = toggleEventParticipation(true, 3);
    expect(result.isParticipating).toBe(false);
    expect(result.participantsCount).toBe(2);
  });
});