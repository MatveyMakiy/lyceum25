import prisma from '../lib/prisma.js';

async function canManageEvent(userId, event) {
  if (event.createdBy === userId) {
    return true;
  }
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId: event.groupId,
      },
    },
  });
  return Boolean(
    membership && ['admin', 'moderator'].includes(membership.role),
  );
}

export async function getEvents(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const search = req.query.search?.trim() || '';
    const groupId = req.query.groupId?.trim() || '';
    const skip = (page - 1) * limit;
    const where = {
      ...(groupId ? { groupId } : {}),
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                },
              },
              {
                description: {
                  contains: search,
                },
              },
              {
                location: {
                  contains: search,
                },
              },
            ],
          }
        : {}),
    };
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: {
          startTime: 'asc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          location: true,
          createdBy: true,
          groupId: true,
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
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);
    const eventsWithPermissions = await Promise.all(
      events.map(async (event) => ({
        ...event,
        canManage: await canManageEvent(req.user.id, event),
      })),
    );
    return res.json({
      items: eventsWithPermissions,
      total,
      page,
      limit,
      hasMore: skip + events.length < total,
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        location: true,
        createdBy: true,
        groupId: true,
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
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!event) {
      return res.status(404).json({
        message: 'Мероприятие не найдено',
      });
    }
    return res.json({
      ...event,
      canManage: await canManageEvent(req.user.id, event),
    });
  } catch (error) {
    console.error('Get event by id error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function createEvent(req, res) {
  try {
    const { title, description, startTime, endTime, location, groupId } =
      req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Название мероприятия обязательно',
      });
    }
    if (!startTime) {
      return res.status(400).json({
        message: 'Дата начала обязательна',
      });
    }
    if (!groupId) {
      return res.status(400).json({
        message: 'Нужно выбрать группу',
      });
    }
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });
    if (!group) {
      return res.status(404).json({
        message: 'Группа не найдена',
      });
    }
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId,
        },
      },
    });
    if (!membership || !['admin', 'moderator'].includes(membership.role)) {
      return res.status(403).json({
        message:
          'Создавать мероприятия могут только администратор и модераторы группы',
      });
    }
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location: location?.trim() || null,
        groupId,
        createdBy: req.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        location: true,
        createdBy: true,
        groupId: true,
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
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return res.status(201).json({
      ...event,
      canManage: true,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, location } = req.body;
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      return res.status(404).json({
        message: 'Мероприятие не найдено',
      });
    }
    const allowed = await canManageEvent(req.user.id, event);
    if (!allowed) {
      return res.status(403).json({
        message: 'Редактировать мероприятие может только создатель, администратор или модератор группы',
      });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Название мероприятия обязательно',
      });
    }
    if (!startTime) {
      return res.status(400).json({
        message: 'Дата начала обязательна',
      });
    }
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location: location?.trim() || null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        location: true,
        createdBy: true,
        groupId: true,
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
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return res.json({
      ...updatedEvent,
      canManage: true,
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      return res.status(404).json({
        message: 'Мероприятие не найдено',
      });
    }
    const allowed = await canManageEvent(req.user.id, event);
    if (!allowed) {
      return res.status(403).json({
        message: 'Удалить мероприятие может только создатель, администратор или модератор группы',
      });
    }
    await prisma.event.delete({
      where: { id },
    });
    return res.json({
      message: 'Мероприятие удалено',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}