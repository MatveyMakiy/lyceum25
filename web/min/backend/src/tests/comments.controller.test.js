import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
  default: {
    post: {
      findUnique: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const prisma = (await import('../lib/prisma.js')).default;
const {
  getPostComments,
  createComment,
  deleteComment,
} = await import('../controllers/comments.controller.js');

function createResponse() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('comments controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns post comments', async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 'post-1',
    });
    prisma.comment.findMany.mockResolvedValue([
      {
        id: 'comment-1',
        content: 'Комментарий',
      },
    ]);
    const req = {
      params: {
        id: 'post-1',
      },
    };
    const res = createResponse();
    await getPostComments(req, res);
    expect(prisma.post.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'post-1',
      },
    });
    expect(prisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          postId: 'post-1',
          parentCommentId: null,
        },
      }),
    );
    expect(res.json).toHaveBeenCalledWith([
      {
        id: 'comment-1',
        content: 'Комментарий',
      },
    ]);
  });
  it('returns 404 if post for comments not found', async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    const req = {
      params: {
        id: 'bad-post',
      },
    };
    const res = createResponse();
    await getPostComments(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Пост не найден',
    });
  });
  it('creates comment', async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 'post-1',
    });
    prisma.comment.create.mockResolvedValue({
      id: 'comment-1',
      content: 'Комментарий',
      author: {
        id: 'user-1',
        firstName: 'Иван',
        lastName: 'Иванов',
      },
    });
    const req = {
      user: {
        id: 'user-1',
      },
      body: {
        postId: 'post-1',
        content: ' Комментарий ',
      },
    };
    const res = createResponse();
    await createComment(req, res);
    expect(prisma.comment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          content: 'Комментарий',
          authorId: 'user-1',
          postId: 'post-1',
        },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'comment-1',
        content: 'Комментарий',
      }),
    );
  });
  it('does not create comment without postId', async () => {
    const req = {
      user: {
        id: 'user-1',
      },
      body: {
        content: 'Комментарий',
      },
    };
    const res = createResponse();
    await createComment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Нужно указать пост',
    });
  });
  it('does not create empty comment', async () => {
    const req = {
      user: {
        id: 'user-1',
      },
      body: {
        postId: 'post-1',
        content: '   ',
      },
    };
    const res = createResponse();
    await createComment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Текст комментария обязателен',
    });
  });
  it('deletes own comment', async () => {
    prisma.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'user-1',
    });
    prisma.comment.delete.mockResolvedValue({
      id: 'comment-1',
    });
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'comment-1',
      },
    };
    const res = createResponse();
    await deleteComment(req, res);
    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: {
        id: 'comment-1',
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: 'Комментарий удалён',
    });
  });
  it('does not delete another user comment', async () => {
    prisma.comment.findUnique.mockResolvedValue({
      id: 'comment-1',
      authorId: 'user-2',
    });
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'comment-1',
      },
    };
    const res = createResponse();
    await deleteComment(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Удалять можно только свои комментарии',
    });
  });
});