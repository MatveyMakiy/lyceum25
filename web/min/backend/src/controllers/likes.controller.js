import prisma from '../lib/prisma.js';

export async function togglePostLike(req, res) {
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
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId: id,
        },
      },
    });
    let liked = false;
    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: req.user.id,
            postId: id,
          },
        },
      });
    } else {
      await prisma.like.create({
        data: {
          userId: req.user.id,
          postId: id,
        },
      });
      liked = true;
    }
    const likesCount = await prisma.like.count({
      where: {
        postId: id,
      },
    });
    return res.json({
      liked,
      likesCount,
    });
  } catch (error) {
    console.error('Toggle post like error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}
