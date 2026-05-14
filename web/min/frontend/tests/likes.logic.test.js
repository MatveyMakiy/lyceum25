import { describe, expect, it } from 'vitest';

function toggleLikeState(hasLike, likesCount) {
  if (hasLike) {
    return {
      liked: false,
      likesCount: likesCount - 1,
    };
  }
  return {
    liked: true,
    likesCount: likesCount + 1,
  };
}

describe('likes logic', () => {
  it('adds like if user has not liked post yet', () => {
    const result = toggleLikeState(false, 0);
    expect(result.liked).toBe(true);
    expect(result.likesCount).toBe(1);
  });
  it('removes like if user already liked post', () => {
    const result = toggleLikeState(true, 5);
    expect(result.liked).toBe(false);
    expect(result.likesCount).toBe(4);
  });
});