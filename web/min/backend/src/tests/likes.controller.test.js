import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
  default: {
    post: {
      findUnique: vi.fn(),
    },
    like: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const prisma = (await import('../lib/prisma.js')).default;
const { togglePostLike } = await import('../controllers/likes.controller.js');

function createResponse() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('likes controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('adds like if user has not liked post yet', async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 'post-1',
    });
    prisma.like.findUnique.mockResolvedValue(null);
    prisma.like.create.mockResolvedValue({
      userId: 'user-1',
      postId: 'post-1',
    });
    prisma.like.count.mockResolvedValue(1);
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'post-1',
      },
    };
    const res = createResponse();
    await togglePostLike(req, res);
    expect(prisma.like.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        postId: 'post-1',
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      liked: true,
      likesCount: 1,
    });
  });
  it('removes like if user already liked post', async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 'post-1',
    });
    prisma.like.findUnique.mockResolvedValue({
      userId: 'user-1',
      postId: 'post-1',
    });
    prisma.like.delete.mockResolvedValue({
      userId: 'user-1',
      postId: 'post-1',
    });
    prisma.like.count.mockResolvedValue(0);
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'post-1',
      },
    };
    const res = createResponse();
    await togglePostLike(req, res);
    expect(prisma.like.delete).toHaveBeenCalledWith({
      where: {
        userId_postId: {
          userId: 'user-1',
          postId: 'post-1',
        },
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      liked: false,
      likesCount: 0,
    });
  });
  it('returns 404 if post not found', async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'bad-post',
      },
    };
    const res = createResponse();
    await togglePostLike(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Пост не найден',
    });
  });
});
