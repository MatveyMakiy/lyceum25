import prisma from '../lib/prisma.js';

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