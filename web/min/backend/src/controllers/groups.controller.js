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
