import prisma from '../lib/prisma.js';

export async function getAdminStats(req, res) {
  try {
    const [
      usersCount,
      groupsCount,
      postsCount,
      commentsCount,
      eventsCount,
      chatsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.group.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.event.count(),
      prisma.chat.count(),
    ]);
    return res.json({
      usersCount,
      groupsCount,
      postsCount,
      commentsCount,
      eventsCount,
      chatsCount,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function getAdminContent(req, res) {
  try {
    const [users, posts, comments, groups, events] = await Promise.all([
      prisma.user.findMany({
        orderBy: [
          {
            role: 'asc',
          },
          {
            lastName: 'asc',
          },
          {
            firstName: 'asc',
          },
        ],
        take: 30,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          class: true,
          createdAt: true,
        },
      }),
      prisma.post.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
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
      prisma.comment.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          post: {
            select: {
              id: true,
              content: true,
            },
          },
        },
      }),
      prisma.group.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
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
      prisma.event.findMany({
        orderBy: {
          startTime: 'asc',
        },
        take: 10,
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          location: true,
          isPublic: true,
          group: {
            select: {
              id: true,
              name: true,
            },
          },
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
    ]);
    return res.json({
      users,
      posts,
      comments,
      groups,
      events,
    });
  } catch (error) {
    console.error('Get admin content error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function adminCreatePublicEvent(req, res) {
  try {
    const { title, description, startTime, endTime, location } = req.body;
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
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location: location?.trim() || null,
        isPublic: true,
        groupId: null,
        createdBy: req.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        location: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(201).json(event);
  } catch (error) {
    console.error('Admin create public event error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function adminUpdateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Недопустимая роль',
      });
    }
    if (id === req.user.id && role !== 'admin') {
      return res.status(400).json({
        message: 'Нельзя снять роль администратора с самого себя',
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        class: true,
        createdAt: true,
      },
    });
    return res.json(updatedUser);
  } catch (error) {
    console.error('Admin update user role error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function adminDeleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({
        message: 'Нельзя удалить самого себя',
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }
    await prisma.user.delete({
      where: {
        id,
      },
    });
    return res.json({
      message: 'Пользователь удалён',
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function adminDeletePost(req, res) {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });
    if (!post) {
      return res.status(404).json({
        message: 'Пост не найден',
      });
    }
    await prisma.post.delete({
      where: {
        id,
      },
    });
    return res.json({
      message: 'Пост удалён',
    });
  } catch (error) {
    console.error('Admin delete post error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function adminDeleteComment(req, res) {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({
      where: {
        id,
      },
    });
    if (!comment) {
      return res.status(404).json({
        message: 'Комментарий не найден',
      });
    }
    await prisma.comment.delete({
      where: {
        id,
      },
    });
    return res.json({
      message: 'Комментарий удалён',
    });
  } catch (error) {
    console.error('Admin delete comment error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function adminDeleteGroup(req, res) {
  try {
    const { id } = req.params;
    const group = await prisma.group.findUnique({
      where: {
        id,
      },
    });
    if (!group) {
      return res.status(404).json({
        message: 'Группа не найдена',
      });
    }
    await prisma.group.delete({
      where: {
        id,
      },
    });
    return res.json({
      message: 'Группа удалена',
    });
  } catch (error) {
    console.error('Admin delete group error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function adminDeleteEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: {
        id,
      },
    });
    if (!event) {
      return res.status(404).json({
        message: 'Мероприятие не найдено',
      });
    }
    await prisma.event.delete({
      where: {
        id,
      },
    });
    return res.json({
      message: 'Мероприятие удалено',
    });
  } catch (error) {
    console.error('Admin delete event error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}