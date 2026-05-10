import { getMyProfile, updateMyProfile } from '../../api/users.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import {
  getCurrentUser,
  saveCurrentUser,
} from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const form = document.getElementById('edit-profile-form');
const errorBox = document.getElementById('edit-profile-error');

renderSidebar(sidebarContainer);

async function loadProfile() {
  try {
    const profile = await getMyProfile();

    form.firstName.value = profile.firstName;
    form.lastName.value = profile.lastName;
    form.class.value = profile.class || '';
    form.bio.value = profile.bio || '';
  } catch (error) {
    errorBox.textContent = error.message;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const userClass = form.class.value.trim();
  const bio = form.bio.value.trim();

  errorBox.textContent = '';

  if (!firstName) {
    errorBox.textContent = 'Введите имя';
    return;
  }

  if (!lastName) {
    errorBox.textContent = 'Введите фамилию';
    return;
  }

  try {
    const updatedProfile = await updateMyProfile({
      firstName,
      lastName,
      class: userClass,
      bio,
    });

    saveCurrentUser(updatedProfile);
    window.location.href = '/profile.html';
  } catch (error) {
    errorBox.textContent = error.message;
  }
});

loadProfile();