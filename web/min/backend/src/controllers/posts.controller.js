import prisma from '../lib/prisma.js';

export async function getPosts(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 2;
    const search = req.query.search?.trim() || '';
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            {
              content: {
                contains: search,
              },
            },
            {
              author: {
                firstName: {
                  contains: search,
                },
              },
            },
            {
              author: {
                lastName: {
                  contains: search,
                },
              },
            },
          ],
        }
      : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
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
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return res.json({
      items: posts,
      total,
      page,
      limit,
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    console.error('Get posts error:', error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function createPost(req, res) {
  try {
    const { content, groupId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Текст поста обязателен',
      });
    }
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
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
        message: 'Публиковать в группе могут только администратор и модераторы',
      });
    }
  }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: req.user.id,
        groupId: groupId || null,
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
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Текст поста обязателен',
      });
    }

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        message: 'Пост не найден',
      });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        message: 'Нет доступа к редактированию поста',
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content: content.trim(),
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
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function deletePost(req, res) {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        message: 'Пост не найден',
      });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        message: 'Нет доступа к удалению поста',
      });
    }

    await prisma.post.delete({
      where: { id },
    });

    return res.json({
      message: 'Пост удалён',
    });
  } catch (error) {
    console.error('Delete post error:', error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}
