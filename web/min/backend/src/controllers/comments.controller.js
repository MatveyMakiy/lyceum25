import prisma from '../lib/prisma.js';

export async function getPostComments(req, res) {
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
    const comments = await prisma.comment.findMany({
      where: {
        postId: id,
        parentCommentId: null,
      },
      orderBy: {
        createdAt: 'asc',
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
          },
        },
      },
    });
    return res.json(comments);
  } catch (error) {
    console.error('Get post comments error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function createComment(req, res) {
  try {
    const { postId, content } = req.body;
    if (!postId) {
      return res.status(400).json({
        message: 'Нужно указать пост',
      });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Текст комментария обязателен',
      });
    }
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      return res.status(404).json({
        message: 'Пост не найден',
      });
    }
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: req.user.id,
        postId,
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
          },
        },
      },
    });
    return res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      return res.status(404).json({
        message: 'Комментарий не найден',
      });
    }
    if (comment.authorId !== req.user.id) {
      return res.status(403).json({
        message: 'Удалять можно только свои комментарии',
      });
    }

    await prisma.comment.delete({
      where: { id },
    });
    return res.json({
      message: 'Комментарий удалён',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}
