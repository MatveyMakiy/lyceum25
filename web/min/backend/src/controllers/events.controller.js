import prisma from '../lib/prisma.js';

async function canManageEvent(userId, userRole, event) {
  if (event.createdBy === userId) {
    return true;
  }
  if (userRole === 'admin') {
    return true;
  }
  if (!event.groupId) {
    return false;
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

function formatEventResponse(event, userId) {
  return {
    ...event,
    participantsCount: event._count?.participants || 0,
    isParticipating:
      event.participants?.some((participant) => participant.userId === userId) ||
      false,
  };
}
const eventSelect = (userId) => ({
  id: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  location: true,
  isPublic: true,
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
  _count: {
    select: {
      participants: true,
    },
  },
  participants: userId
    ? {
        where: {
          userId,
        },
        select: {
          userId: true,
        },
      }
    : {
        select: {
          userId: true,
        },
      },
});

export async function getPublicEvents(req, res) {
  try {
    const limit = Number(req.query.limit) || 3;
    const events = await prisma.event.findMany({
      where: {
        isPublic: true,
        startTime: {
          gte: new Date(),
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      take: limit,
      select: eventSelect(null),
    });
    return res.json({
      items: events.map((event) => formatEventResponse(event, null)),
    });
  } catch (error) {
    console.error('Get public events error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function getEvents(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const search = req.query.search?.trim() || '';
    const groupId = req.query.groupId?.trim() || '';
    const scope = req.query.scope?.trim() || '';
    const skip = (page - 1) * limit;
    let baseFilter = {};
    if (groupId) {
      baseFilter = { groupId };
    }
    if (scope === 'my') {
      const memberships = await prisma.groupMember.findMany({
        where: {
          userId: req.user.id,
        },
        select: {
          groupId: true,
        },
      });
      const groupIds = memberships.map((membership) => membership.groupId);
      baseFilter = {
        OR: [
          {
            isPublic: true,
          },
          {
            groupId: {
              in: groupIds,
            },
          },
        ],
        startTime: {
          gte: new Date(),
        },
      };
    }
    const searchFilter = search
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
      : {};
    const where = search
      ? {
          AND: [baseFilter, searchFilter],
        }
      : baseFilter;
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: {
          startTime: 'asc',
        },
        skip,
        take: limit,
        select: eventSelect(req.user.id),
      }),
      prisma.event.count({ where }),
    ]);
    const eventsWithPermissions = await Promise.all(
      events.map(async (event) => ({
        ...formatEventResponse(event, req.user.id),
        canManage: await canManageEvent(req.user.id, req.user.role, event),
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
      select: eventSelect(req.user.id),
    });
    if (!event) {
      return res.status(404).json({
        message: 'Мероприятие не найдено',
      });
    }
    return res.json({
      ...formatEventResponse(event, req.user.id),
      canManage: await canManageEvent(req.user.id, req.user.role, event),
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
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      groupId,
      isPublic,
    } = req.body;
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
    const shouldCreatePublicEvent = Boolean(isPublic) && !groupId;
    if (shouldCreatePublicEvent && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Публичные мероприятия может создавать только администратор',
      });
    }
    if (!shouldCreatePublicEvent && !groupId) {
      return res.status(400).json({
        message: 'Нужно выбрать группу',
      });
    }
    if (groupId) {
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
    }
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location: location?.trim() || null,
        isPublic: shouldCreatePublicEvent,
        groupId: shouldCreatePublicEvent ? null : groupId,
        createdBy: req.user.id,
      },
      select: eventSelect(req.user.id),
    });
    return res.status(201).json({
      ...formatEventResponse(event, req.user.id),
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
    const allowed = await canManageEvent(req.user.id, req.user.role, event);
    if (!allowed) {
      return res.status(403).json({
        message:
          'Редактировать мероприятие может только создатель, администратор или модератор группы',
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
      select: eventSelect(req.user.id),
    });
    return res.json({
      ...formatEventResponse(updatedEvent, req.user.id),
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
    const allowed = await canManageEvent(req.user.id, req.user.role, event);
    if (!allowed) {
      return res.status(403).json({
        message:
          'Удалить мероприятие может только создатель, администратор или модератор группы',
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

export async function joinEvent(req, res) {
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
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId: id,
        },
      },
    });
    if (existingParticipant) {
      return res.status(400).json({
        message: 'Вы уже записаны на мероприятие',
      });
    }
    await prisma.eventParticipant.create({
      data: {
        userId: req.user.id,
        eventId: id,
      },
    });
    const participantsCount = await prisma.eventParticipant.count({
      where: {
        eventId: id,
      },
    });
    return res.status(201).json({
      message: 'Вы записались на мероприятие',
      isParticipating: true,
      participantsCount,
    });
  } catch (error) {
    console.error('Join event error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function leaveEvent(req, res) {
  try {
    const { id } = req.params;
    const participant = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId: id,
        },
      },
    });
    if (!participant) {
      return res.status(404).json({
        message: 'Вы не записаны на мероприятие',
      });
    }
    await prisma.eventParticipant.delete({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId: id,
        },
      },
    });
    const participantsCount = await prisma.eventParticipant.count({
      where: {
        eventId: id,
      },
    });
    return res.json({
      message: 'Запись на мероприятие отменена',
      isParticipating: false,
      participantsCount,
    });
  } catch (error) {
    console.error('Leave event error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}