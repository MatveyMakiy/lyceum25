import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
  default: {
    user: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    group: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    post: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    comment: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    event: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    chat: {
      count: vi.fn(),
    },
  },
}));

const prisma = (await import('../lib/prisma.js')).default;
const {
  adminCreatePublicEvent,
  adminDeleteEvent,
  adminDeleteGroup,
  adminDeletePost,
  adminDeleteUser,
  adminUpdateUserRole,
  getAdminContent,
  getAdminStats,
} = await import('../controllers/admin.controller.js');

function createResponse() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('admin controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns admin stats', async () => {
    prisma.user.count.mockResolvedValue(2);
    prisma.group.count.mockResolvedValue(3);
    prisma.post.count.mockResolvedValue(4);
    prisma.comment.count.mockResolvedValue(5);
    prisma.event.count.mockResolvedValue(6);
    prisma.chat.count.mockResolvedValue(7);
    const req = {};
    const res = createResponse();
    await getAdminStats(req, res);
    expect(res.json).toHaveBeenCalledWith({
      usersCount: 2,
      groupsCount: 3,
      postsCount: 4,
      commentsCount: 5,
      eventsCount: 6,
      chatsCount: 7,
    });
  });
  it('returns admin content', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        firstName: 'Иван',
      },
    ]);
    prisma.post.findMany.mockResolvedValue([
      {
        id: 'post-1',
        content: 'Пост',
      },
    ]);
    prisma.comment.findMany.mockResolvedValue([
      {
        id: 'comment-1',
        content: 'Комментарий',
      },
    ]);
    prisma.group.findMany.mockResolvedValue([
      {
        id: 'group-1',
        name: 'Группа',
      },
    ]);
    prisma.event.findMany.mockResolvedValue([
      {
        id: 'event-1',
        title: 'Мероприятие',
      },
    ]);
    const req = {};
    const res = createResponse();
    await getAdminContent(req, res);
    expect(res.json).toHaveBeenCalledWith({
      users: [
        {
          id: 'user-1',
          firstName: 'Иван',
        },
      ],
      posts: [
        {
          id: 'post-1',
          content: 'Пост',
        },
      ],
      comments: [
        {
          id: 'comment-1',
          content: 'Комментарий',
        },
      ],
      groups: [
        {
          id: 'group-1',
          name: 'Группа',
        },
      ],
      events: [
        {
          id: 'event-1',
          title: 'Мероприятие',
        },
      ],
    });
  });
  it('creates public event', async () => {
    prisma.event.create.mockResolvedValue({
      id: 'event-1',
      title: 'День открытых дверей',
      isPublic: true,
    });
    const req = {
      user: {
        id: 'admin-1',
      },
      body: {
        title: ' День открытых дверей ',
        description: 'Описание',
        startTime: '2026-05-20T10:00',
        endTime: '',
        location: 'Лицей',
      },
    };
    const res = createResponse();
    await adminCreatePublicEvent(req, res);
    expect(prisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'День открытых дверей',
          description: 'Описание',
          isPublic: true,
          groupId: null,
          createdBy: 'admin-1',
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 'event-1',
      title: 'День открытых дверей',
      isPublic: true,
    });
  });
  it('does not create public event without title', async () => {
    const req = {
      user: {
        id: 'admin-1',
      },
      body: {
        title: '',
        startTime: '2026-05-20T10:00',
      },
    };
    const res = createResponse();
    await adminCreatePublicEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Название мероприятия обязательно',
    });
  });
  it('does not create public event without start time', async () => {
    const req = {
      user: {
        id: 'admin-1',
      },
      body: {
        title: 'Мероприятие',
      },
    };
    const res = createResponse();
    await adminCreatePublicEvent(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Дата начала обязательна',
    });
  });
  it('updates user role', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      role: 'user',
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-2',
      role: 'admin',
    });
    const req = {
      user: {
        id: 'admin-1',
      },
      params: {
        id: 'user-2',
      },
      body: {
        role: 'admin',
      },
    };
    const res = createResponse();
    await adminUpdateUserRole(req, res);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'user-2',
        },
        data: {
          role: 'admin',
        },
      }),
    );
    expect(res.json).toHaveBeenCalledWith({
      id: 'user-2',
      role: 'admin',
    });
  });
  it('does not allow invalid user role', async () => {
    const req = {
      user: {
        id: 'admin-1',
      },
      params: {
        id: 'user-2',
      },
      body: {
        role: 'superadmin',
      },
    };
    const res = createResponse();
    await adminUpdateUserRole(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Недопустимая роль',
    });
  });
  it('does not allow admin to remove admin role from himself', async () => {
    const req = {
      user: {
        id: 'admin-1',
      },
      params: {
        id: 'admin-1',
      },
      body: {
        role: 'user',
      },
    };
    const res = createResponse();
    await adminUpdateUserRole(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Нельзя снять роль администратора с самого себя',
    });
  });
  it('deletes another user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
    });
    prisma.user.delete.mockResolvedValue({
      id: 'user-2',
    });
    const req = {
      user: {
        id: 'admin-1',
      },
      params: {
        id: 'user-2',
      },
    };
    const res = createResponse();
    await adminDeleteUser(req, res);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: {
        id: 'user-2',
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: 'Пользователь удалён',
    });
  });
  it('does not delete himself', async () => {
    const req = {
      user: {
        id: 'admin-1',
      },
      params: {
        id: 'admin-1',
      },
    };
    const res = createResponse();
    await adminDeleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Нельзя удалить самого себя',
    });
  });
  it('deletes post', async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: 'post-1',
    });
    prisma.post.delete.mockResolvedValue({
      id: 'post-1',
    });
    const req = {
      params: {
        id: 'post-1',
      },
    };
    const res = createResponse();
    await adminDeletePost(req, res);
    expect(prisma.post.delete).toHaveBeenCalledWith({
      where: {
        id: 'post-1',
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: 'Пост удалён',
    });
  });
  it('deletes group', async () => {
    prisma.group.findUnique.mockResolvedValue({
      id: 'group-1',
    });
    prisma.group.delete.mockResolvedValue({
      id: 'group-1',
    });
    const req = {
      params: {
        id: 'group-1',
      },
    };
    const res = createResponse();
    await adminDeleteGroup(req, res);
    expect(prisma.group.delete).toHaveBeenCalledWith({
      where: {
        id: 'group-1',
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: 'Группа удалена',
    });
  });
  it('deletes event', async () => {
    prisma.event.findUnique.mockResolvedValue({
      id: 'event-1',
    });
    prisma.event.delete.mockResolvedValue({
      id: 'event-1',
    });
    const req = {
      params: {
        id: 'event-1',
      },
    };
    const res = createResponse();
    await adminDeleteEvent(req, res);
    expect(prisma.event.delete).toHaveBeenCalledWith({
      where: {
        id: 'event-1',
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: 'Мероприятие удалено',
    });
  });
});