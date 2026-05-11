import { getMyProfile } from '../../api/users.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const profileStatus = document.getElementById('profile-status');
const profileContent = document.getElementById('profile-content');
const profileInitials = document.getElementById('profile-initials');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileClass = document.getElementById('profile-class');
const profileBio = document.getElementById('profile-bio');

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
  try {
    showStatus('Загрузка...');

    const profile = await getMyProfile();

    profileInitials.textContent = getInitials(
      profile.firstName,
      profile.lastName,
    );
    profileName.textContent = `${profile.firstName} ${profile.lastName}`;
    profileEmail.textContent = profile.email;
    profileClass.textContent = profile.class || 'Не указан';
    profileBio.textContent = profile.bio || 'Пока ничего не указано';

    hideStatus();
    profileContent.style.display = 'block';
  } catch (error) {
    showStatus(error.message);
  }
}

loadProfile();