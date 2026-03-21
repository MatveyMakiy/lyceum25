import { posts } from '../mock/posts.js';

export function getPosts(page = 1, limit = 2) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * limit;
      const end = start + limit;

      resolve({
        items: posts.slice(start, end),
        hasMore: end < posts.length,
      });
    }, 300);
  });
}
