import { getGroupById, updateGroup } from '../../api/groups.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const form = document.getElementById('edit-group-form');
const errorBox = document.getElementById('edit-group-error');
const cancelLink = document.getElementById('cancel-edit-group-link');

const params = new URLSearchParams(window.location.search);
const groupId = params.get('id');

renderSidebar(sidebarContainer);

async function loadGroup() {
  if (!groupId) {
    errorBox.textContent = 'Группа не найдена';
    return;
  }
  try {
    const group = await getGroupById(groupId);
    const membership = group.members[0];
    if (membership?.role !== 'admin') {
      errorBox.textContent = 'Редактировать группу может только администратор';
      form.querySelector('button[type="submit"]').disabled = true;
      return;
    }
    form.name.value = group.name;
    form.description.value = group.description || '';
    cancelLink.href = `/group.html?id=${groupId}`;
  } catch (error) {
    errorBox.textContent = error.message;
  }
}

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
    await updateGroup(groupId, {
      name,
      description,
    });
    window.location.href = `/group.html?id=${groupId}`;
  } catch (error) {
    errorBox.textContent = error.message;
  }
});

loadGroup();
