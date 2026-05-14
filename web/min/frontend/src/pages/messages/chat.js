import { getChatById, sendChatMessage } from '../../api/chats.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const chatStatus = document.getElementById('chat-status');
const chatPage = document.getElementById('chat-page');
const chatTitle = document.getElementById('chat-title');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatError = document.getElementById('chat-error');

const params = new URLSearchParams(window.location.search);
const chatId = params.get('id');

renderSidebar(sidebarContainer);

function showStatus(message) {
  chatStatus.textContent = message;
  chatStatus.style.display = 'block';
}

function hideStatus() {
  chatStatus.textContent = '';
  chatStatus.style.display = 'none';
}

function getChatTitle(chat) {
  if (chat.title) {
    return chat.title;
  }
  const otherMembers = chat.members.filter((user) => user.id !== currentUser.id);
  if (otherMembers.length === 0) {
    return 'Избранное';
  }

  return otherMembers
    .map((user) => `${user.firstName} ${user.lastName}`)
    .join(', ');
}

function createMessageCard(message) {
  const card = document.createElement('article');
  const isOwnMessage = message.author.id === currentUser.id;
  card.className = isOwnMessage
    ? 'chat-message chat-message--own'
    : 'chat-message';
  card.innerHTML = `
    <p class="chat-message__author">
      ${message.author.firstName} ${message.author.lastName}
    </p>
    <p class="chat-message__text">${message.content}</p>
    <span class="chat-message__date">
      ${new Date(message.createdAt).toLocaleString('ru-RU')}
    </span>
  `;
  return card;
}

function renderMessages(messages) {
  chatMessages.innerHTML = '';
  messages.forEach((message) => {
    chatMessages.appendChild(createMessageCard(message));
  });
}

async function loadChat() {
  if (!chatId) {
    showStatus('Чат не найден');
    return;
  }
  try {
    showStatus('Загрузка...');
    const chat = await getChatById(chatId);
    chatTitle.textContent = getChatTitle(chat);
    renderMessages(chat.messages);
    hideStatus();
    chatPage.style.display = 'block';
  } catch (error) {
    showStatus(error.message);
  }
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const content = chatForm.content.value.trim();
  chatError.textContent = '';
  if (!content) {
    chatError.textContent = 'Введите сообщение';
    return;
  }
  try {
    await sendChatMessage(chatId, content);
    chatForm.reset();
    await loadChat();
  } catch (error) {
    chatError.textContent = error.message;
  }
});

loadChat();