import { createEvent } from '../../api/events.js';
import { getGroups } from '../../api/groups.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const form = document.getElementById('create-event-form');
const groupSelect = document.getElementById('event-group-select');
const errorBox = document.getElementById('create-event-error');

renderSidebar(sidebarContainer);

async function loadGroups() {
  try {
    const result = await getGroups(1, 100, '');
    result.items.forEach((group) => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.name;
      groupSelect.appendChild(option);
    });
  } catch (error) {
    errorBox.textContent = error.message;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = form.title.value.trim();
  const description = form.description.value.trim();
  const startTime = form.startTime.value;
  const endTime = form.endTime.value;
  const location = form.location.value.trim();
  const groupId = form.groupId.value;
  errorBox.textContent = '';
  if (!title) {
    errorBox.textContent = 'Введите название мероприятия';
    return;
  }
  if (!startTime) {
    errorBox.textContent = 'Выберите дату начала';
    return;
  }
  if (!groupId) {
    errorBox.textContent = 'Выберите группу';
    return;
  }
  try {
    await createEvent({
      title,
      description,
      startTime,
      endTime,
      location,
      groupId,
    });
    window.location.href = '/events.html';
  } catch (error) {
    errorBox.textContent = error.message;
  }
});

loadGroups();