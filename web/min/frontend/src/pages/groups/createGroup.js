import { createGroup } from '../../api/groups.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const form = document.getElementById('create-group-form');
const errorBox = document.getElementById('create-group-error');

renderSidebar(sidebarContainer);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = form.name.value.trim();
  const description = form.description.value.trim();

  errorBox.textContent = '';

  if (!name) {
    errorBox.textContent = 'Введите название группы';
    return;
  }

  try {
    await createGroup({
      name,
      description,
    });

    window.location.href = '/groups.html';
  } catch (error) {
    errorBox.textContent = error.message;
  }
});