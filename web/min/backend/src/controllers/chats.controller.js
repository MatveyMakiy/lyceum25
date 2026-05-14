import prisma from '../lib/prisma.js';

function formatUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

export async function getChats(req, res) {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        type: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    return res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function createDirectChat(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        message: 'Нужно выбрать пользователя',
      });
    }
    if (userId === req.user.id) {
      return res.status(400).json({
        message: 'Нельзя создать чат с самим собой',
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: 'direct',
        AND: [
          {
            members: {
              some: {
                userId: req.user.id,
              },
            },
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });
    if (existingChat) {
      return res.json(existingChat);
    }
    const chat = await prisma.chat.create({
      data: {
        type: 'direct',
        members: {
          create: [
            {
              userId: req.user.id,
            },
            {
              userId,
            },
          ],
        },
      },
      select: {
        id: true,
      },
    });
    return res.status(201).json(chat);
  } catch (error) {
    console.error('Create direct chat error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function getChatById(req, res) {
  try {
    const { id } = req.params;
    const membership = await prisma.chatMember.findUnique({
      where: {
        userId_chatId: {
          userId: req.user.id,
          chatId: id,
        },
      },
    });
    if (!membership) {
      return res.status(403).json({
        message: 'У вас нет доступа к этому чату',
      });
    }
    const chat = await prisma.chat.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        type: true,
        title: true,
        members: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
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
          },
        },
      },
    });
    if (!chat) {
      return res.status(404).json({
        message: 'Чат не найден',
      });
    }
    return res.json({
      ...chat,
      members: chat.members.map((member) => formatUser(member.user)),
    });
  } catch (error) {
    console.error('Get chat by id error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function sendChatMessage(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Введите текст сообщения',
      });
    }
    const membership = await prisma.chatMember.findUnique({
      where: {
        userId_chatId: {
          userId: req.user.id,
          chatId: id,
        },
      },
    });
    if (!membership) {
      return res.status(403).json({
        message: 'У вас нет доступа к этому чату',
      });
    }
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        authorId: req.user.id,
        chatId: id,
      },
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
      },
    });
    await prisma.chat.update({
      where: {
        id,
      },
      data: {
        updatedAt: new Date(),
      },
    });
    return res.status(201).json(message);
  } catch (error) {
    console.error('Send chat message error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}

export async function getOrCreateGroupChat(req, res) {
  try {
    const { groupId } = req.params;
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId,
        },
      },
    });
    if (!membership) {
      return res.status(403).json({
        message: 'Чат доступен только участникам группы',
      });
    }
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        id: true,
        name: true,
      },
    });
    if (!group) {
      return res.status(404).json({
        message: 'Группа не найдена',
      });
    }
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: 'group',
        groupId,
      },
      select: {
        id: true,
      },
    });
    if (existingChat) {
      return res.json(existingChat);
    }
    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId,
      },
      select: {
        userId: true,
      },
    });
    const chat = await prisma.chat.create({
      data: {
        type: 'group',
        title: `Чат группы «${group.name}»`,
        groupId,
        members: {
          create: groupMembers.map((member) => ({
            userId: member.userId,
          })),
        },
      },
      select: {
        id: true,
      },
    });
    return res.status(201).json(chat);
  } catch (error) {
    console.error('Get or create group chat error:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
    });
  }
}