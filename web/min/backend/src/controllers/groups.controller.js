import prisma from '../lib/prisma.js';

export async function getGroups(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const search = req.query.search?.trim() || '';
    const skip = (page - 1) * limit;
    const where = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};
    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.group.count({ where }),
    ]);
    return res.json({
      items: groups,
      total,
      page,
      limit,
      hasMore: skip + groups.length < total,
    });
  } catch (error) {
    console.error('Get groups error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function createGroup(req, res) {
  try {
    const { name, description, avatarUrl } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Название группы обязательно',
      });
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        createdBy: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'admin',
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json(group);
  } catch (error) {
    console.error('Create group error:', error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function getGroupById(req, res) {
  try {
    const { id } = req.params;

    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          where: {
            userId: req.user.id,
          },
          select: {
            role: true,
          },
        },
        posts: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({
        message: 'Группа не найдена',
      });
    }

    return res.json(group);
  } catch (error) {
    console.error('Get group by id error:', error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function getGroupMembers(req, res) {
  try {
    const { id } = req.params;
    const group = await prisma.group.findUnique({
      where: { id },
    });
    if (!group) {
      return res.status(404).json({
        message: 'Группа не найдена',
      });
    }
    const members = await prisma.groupMember.findMany({
      where: {
        groupId: id,
      },
      orderBy: [
        {
          role: 'asc',
        },
        {
          joinedAt: 'asc',
        },
      ],
      select: {
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    return res.json(members);
  } catch (error) {
    console.error('Get group members error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function joinGroup(req, res) {
  try {
    const { id } = req.params;
    const group = await prisma.group.findUnique({
      where: { id },
    });
    if (!group) {
      return res.status(404).json({
        message: 'Группа не найдена',
      });
    }
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
    });
    if (existingMembership) {
      return res.status(400).json({
        message: 'Вы уже состоите в этой группе',
      });
    }
    await prisma.groupMember.create({
      data: {
        userId: req.user.id,
        groupId: id,
        role: 'member',
      },
    });
    const groupChat = await prisma.chat.findFirst({
      where: {
        type: 'group',
        groupId: id,
      },
    });
  if (groupChat) {
    await prisma.chatMember.create({
      data: {
        userId: req.user.id,
        chatId: groupChat.id,
      },
    });
  }
    return res.status(201).json({
      message: 'Вы вступили в группу',
    });
  } catch (error) {
    console.error('Join group error:', error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function leaveGroup(req, res) {
  try {
    const { id } = req.params;
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
    });
    if (!membership) {
      return res.status(404).json({
        message: 'Вы не состоите в этой группе',
      });
    }
    if (membership.role === 'admin') {
      return res.status(400).json({
        message: 'Администратор не может выйти из своей группы',
      });
    }
    const groupChat = await prisma.chat.findFirst({
      where: {
        type: 'group',
        groupId: id,
      },
    });
    if (groupChat) {
      await prisma.chatMember.deleteMany({
        where: {
          userId: req.user.id,
          chatId: groupChat.id,
        },
      });
    }
    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
    });
    return res.json({
      message: 'Вы вышли из группы',
    });
  } catch (error) {
    console.error('Leave group error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function updateGroupMemberRole(req, res) {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    if (!['member', 'moderator'].includes(role)) {
      return res.status(400).json({
        message: 'Недопустимая роль',
      });
    }
    const currentMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
    });
    if (!currentMembership || currentMembership.role !== 'admin') {
      return res.status(403).json({
        message: 'Изменять роли может только администратор группы',
      });
    }
    const targetMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: id,
        },
      },
    });
    if (!targetMembership) {
      return res.status(404).json({
        message: 'Участник не найден',
      });
    }
    if (targetMembership.role === 'admin') {
      return res.status(400).json({
        message: 'Нельзя изменить роль администратора',
      });
    }
    const updatedMembership = await prisma.groupMember.update({
      where: {
        userId_groupId: {
          userId,
          groupId: id,
        },
      },
      data: {
        role,
      },
      select: {
        role: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    return res.json(updatedMembership);
  } catch (error) {
    console.error('Update group member role error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}