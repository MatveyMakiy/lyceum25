import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
  default: {
    group: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    groupMember: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    chat: {
      findFirst: vi.fn(),
    },
    chatMember: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

const prisma = (await import('../lib/prisma.js')).default;
const {
  getGroups,
  createGroup,
  getGroupById,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  updateGroup,
} = await import('../controllers/groups.controller.js');

function createResponse() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('groups controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns groups list', async () => {
    prisma.group.findMany.mockResolvedValue([
      {
        id: 'group-1',
        name: 'Группа',
      },
    ]);
    prisma.group.count.mockResolvedValue(1);
    const req = {
      query: {
        page: '1',
        limit: '6',
        search: 'Группа',
      },
    };
    const res = createResponse();
    await getGroups(req, res);
    expect(prisma.group.findMany).toHaveBeenCalledOnce();
    expect(prisma.group.count).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.any(Array),
        total: 1,
        page: 1,
        limit: 6,
        hasMore: false,
      }),
    );
  });
  it('creates group and admin membership', async () => {
    prisma.group.create.mockResolvedValue({
      id: 'group-1',
      name: 'Группа',
      description: 'Описание',
    });
    const req = {
      user: {
        id: 'user-1',
      },
      body: {
        name: ' Группа ',
        description: ' Описание ',
      },
    };
    const res = createResponse();
    await createGroup(req, res);
    expect(prisma.group.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Группа',
          description: 'Описание',
          createdBy: 'user-1',
          members: {
            create: {
              userId: 'user-1',
              role: 'admin',
            },
          },
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'group-1',
        name: 'Группа',
      }),
    );
  });
  it('does not create group without name', async () => {
    const req = {
      user: {
        id: 'user-1',
      },
      body: {
        name: '',
        description: 'Описание',
      },
    };
    const res = createResponse();
    await createGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Название группы обязательно',
    });
  });
  it('returns group by id', async () => {
    prisma.group.findUnique.mockResolvedValue({
      id: 'group-1',
      name: 'Группа',
      members: [
        {
          role: 'admin',
          userId: 'user-1',
        },
      ],
    });
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'group-1',
      },
    };
    const res = createResponse();
    await getGroupById(req, res);
    expect(prisma.group.findUnique).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'group-1',
        name: 'Группа',
      }),
    );
  });
  it('returns 404 if group not found', async () => {
    prisma.group.findUnique.mockResolvedValue(null);
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'bad-group',
      },
    };
    const res = createResponse();
    await getGroupById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Группа не найдена',
    });
  });
  it('returns group members', async () => {
    prisma.group.findUnique.mockResolvedValue({
      id: 'group-1',
    });
    prisma.groupMember.findMany.mockResolvedValue([
      {
        role: 'admin',
        user: {
          id: 'user-1',
        },
      },
    ]);
    const req = {
      params: {
        id: 'group-1',
      },
    };
    const res = createResponse();
    await getGroupMembers(req, res);
    expect(prisma.groupMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          groupId: 'group-1',
        },
      }),
    );
    expect(res.json).toHaveBeenCalledWith([
      {
        role: 'admin',
        user: {
          id: 'user-1',
        },
      },
    ]);
  });
  it('joins group', async () => {
    prisma.group.findUnique.mockResolvedValue({
      id: 'group-1',
    });
    prisma.groupMember.findUnique.mockResolvedValue(null);
    prisma.groupMember.create.mockResolvedValue({
      userId: 'user-1',
      groupId: 'group-1',
      role: 'member',
    });
    prisma.chat.findFirst.mockResolvedValue(null);
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'group-1',
      },
    };
    const res = createResponse();
    await joinGroup(req, res);
    expect(prisma.groupMember.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        groupId: 'group-1',
        role: 'member',
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
  it('does not join group twice', async () => {
    prisma.group.findUnique.mockResolvedValue({
      id: 'group-1',
    });
    prisma.groupMember.findUnique.mockResolvedValue({
      userId: 'user-1',
      groupId: 'group-1',
    });
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'group-1',
      },
    };
    const res = createResponse();
    await joinGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Вы уже состоите в этой группе',
    });
  });
  it('leaves group', async () => {
    prisma.groupMember.findUnique.mockResolvedValue({
      userId: 'user-1',
      groupId: 'group-1',
      role: 'member',
    });
    prisma.chat.findFirst.mockResolvedValue({
      id: 'chat-1',
    });
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'group-1',
      },
    };
    const res = createResponse();
    await leaveGroup(req, res);
    expect(prisma.chatMember.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        chatId: 'chat-1',
      },
    });
    expect(prisma.groupMember.delete).toHaveBeenCalledWith({
      where: {
        userId_groupId: {
          userId: 'user-1',
          groupId: 'group-1',
        },
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      message: 'Вы вышли из группы',
    });
  });
  it('does not allow admin to leave group', async () => {
    prisma.groupMember.findUnique.mockResolvedValue({
      userId: 'user-1',
      groupId: 'group-1',
      role: 'admin',
    });
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'group-1',
      },
    };
    const res = createResponse();
    await leaveGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Администратор не может выйти из своей группы',
    });
  });
  it('updates group by admin', async () => {
    prisma.groupMember.findUnique.mockResolvedValue({
      userId: 'user-1',
      groupId: 'group-1',
      role: 'admin',
    });
    prisma.group.update.mockResolvedValue({
      id: 'group-1',
      name: 'Новое название',
    });
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'group-1',
      },
      body: {
        name: ' Новое название ',
        description: 'Описание',
      },
    };
    const res = createResponse();
    await updateGroup(req, res);
    expect(prisma.group.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'group-1',
        },
        data: expect.objectContaining({
          name: 'Новое название',
          description: 'Описание',
        }),
      }),
    );
    expect(res.json).toHaveBeenCalledWith({
      id: 'group-1',
      name: 'Новое название',
    });
  });
  it('does not update group without admin role', async () => {
    prisma.groupMember.findUnique.mockResolvedValue({
      userId: 'user-1',
      groupId: 'group-1',
      role: 'member',
    });
    const req = {
      user: {
        id: 'user-1',
      },
      params: {
        id: 'group-1',
      },
      body: {
        name: 'Название',
      },
    };
    const res = createResponse();
    await updateGroup(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Редактировать группу может только администратор группы',
    });
  });
});