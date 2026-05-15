import { getUserById } from '../../api/users.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';
import { createDirectChat } from '../../api/chats.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const profileStatus = document.getElementById('user-profile-status');
const profileContent = document.getElementById('user-profile-content');
const profileInitials = document.getElementById('user-profile-initials');
const profileName = document.getElementById('user-profile-name');
const profileClass = document.getElementById('user-profile-class');
const profileBio = document.getElementById('user-profile-bio');
const startChatButton = document.getElementById('start-chat-btn');
const startChatError = document.getElementById('start-chat-error');

const params = new URLSearchParams(window.location.search);
const userId = params.get('id');

renderSidebar(sidebarContainer);

function showStatus(message) {
  profileStatus.textContent = message;
  profileStatus.style.display = 'block';
}

function hideStatus() {
  profileStatus.textContent = '';
  profileStatus.style.display = 'none';
}

function getInitials(firstName, lastName) {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

async function loadProfile() {
  if (!userId) {
    showStatus('Пользователь не найден');
    return;
  }

  if (userId === currentUser.id) {
    window.location.href = '/profile.html';
    return;
  }

  try {
    showStatus('Загрузка...');
    const profile = await getUserById(userId);
    profileInitials.textContent = getInitials(
      profile.firstName,
      profile.lastName,
    );
    profileName.textContent = `${profile.firstName} ${profile.lastName}`;
    profileClass.textContent = profile.class || 'Не указан';
    profileBio.textContent = profile.bio || 'Пока ничего не указано';
    hideStatus();
    profileContent.style.display = 'block';
  } catch (error) {
    showStatus(error.message);
  }
}

startChatButton.addEventListener('click', async () => {
  try {
    startChatError.textContent = '';
    const chat = await createDirectChat(userId);
    window.location.href = `/chat.html?id=${chat.id}`;
  } catch (error) {
    startChatError.textContent = error.message;
  }
});

loadProfile();
