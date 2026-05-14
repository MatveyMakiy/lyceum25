import { getChats } from '../../api/chats.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const statusBox = document.getElementById('messages-status');
const chatsList = document.getElementById('chats-list');

renderSidebar(sidebarContainer);

function showStatus(message) {
  statusBox.textContent = message;
  statusBox.style.display = 'block';
}

function hideStatus() {
  statusBox.textContent = '';
  statusBox.style.display = 'none';
}

function getChatTitle(chat) {
  if (chat.title) {
    return chat.title;
  }
  const otherMembers = chat.members
    .map((member) => member.user)
    .filter((user) => user.id !== currentUser.id);
  if (otherMembers.length === 0) {
    return 'Избранное';
  }
  return otherMembers
    .map((user) => `${user.firstName} ${user.lastName}`)
    .join(', ');
}

function createChatCard(chat) {
  const card = document.createElement('a');
  card.className = 'chat-card';
  card.href = `/chat.html?id=${chat.id}`;
  const lastMessage = chat.messages[0];
  card.innerHTML = `
    <p class="chat-card__title">${getChatTitle(chat)}</p>
    <p class="chat-card__last">
      ${lastMessage ? lastMessage.content : 'Сообщений пока нет'}
    </p>
  `;
  return card;
}

function renderChats(chats) {
  chatsList.innerHTML = '';
  if (chats.length === 0) {
    showStatus('Чатов пока нет. Откройте профиль пользователя и начните диалог.');
    return;
  }
  hideStatus();
  chats.forEach((chat) => {
    chatsList.appendChild(createChatCard(chat));
  });
}

async function loadChats() {
  try {
    showStatus('Загрузка...');
    const chats = await getChats();
    renderChats(chats);
  } catch (error) {
    showStatus(error.message);
  }
}

loadChats();