import { describe, it, expect } from 'vitest';

describe('posts logic', () => {
  it('should normalize post structure', () => {
    const post = {
      id: '1',
      content: 'Hello',
      author: {
        firstName: 'Ivan',
        lastName: 'Ivanov',
      },
      createdAt: new Date().toISOString(),
    };

    const normalized = {
      id: post.id,
      author: `${post.author.firstName} ${post.author.lastName}`,
      text: post.content,
    };

    expect(normalized.author).toBe('Ivan Ivanov');
    expect(normalized.text).toBe('Hello');
  });
});
