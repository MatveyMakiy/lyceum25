import prisma from '../lib/prisma.js';

export async function getUsers(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || '';
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            {
              firstName: {
                contains: search,
              },
            },
            {
              lastName: {
                contains: search,
              },
            },
            {
              class: {
                contains: search,
              },
            },
          ],
        }
      : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: [
          {
            lastName: 'asc',
          },
          {
            firstName: 'asc',
          },
        ],
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          class: true,
          avatarUrl: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    return res.json({
      items: users,
      total,
      page,
      limit,
      hasMore: skip + users.length < total,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        class: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }
    return res.json(user);
  } catch (error) {
    console.error('Get user by id error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const { firstName, lastName, class: userClass, bio } = req.body;

    if (!firstName || !firstName.trim()) {
      return res.status(400).json({
        message: 'Имя обязательно',
      });
    }

    if (!lastName || !lastName.trim()) {
      return res.status(400).json({
        message: 'Фамилия обязательна',
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        class: userClass?.trim() || null,
        bio: bio?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        class: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error('Update my profile error:', error);

    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}