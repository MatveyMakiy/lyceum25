import { getEventById, updateEvent } from '../../api/events.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const form = document.getElementById('edit-event-form');
const errorBox = document.getElementById('edit-event-error');

const params = new URLSearchParams(window.location.search);
const eventId = params.get('id');

renderSidebar(sidebarContainer);

function toDatetimeLocalValue(dateString) {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

async function loadEvent() {
  if (!eventId) {
    errorBox.textContent = 'Мероприятие не найдено';
    return;
  }

  try {
    const event = await getEventById(eventId);
    if (!event.canManage) {
      errorBox.textContent =
        'У вас нет прав на редактирование этого мероприятия';
      form.querySelector('button[type="submit"]').disabled = true;
      return;
    }
    form.title.value = event.title;
    form.description.value = event.description || '';
    form.startTime.value = toDatetimeLocalValue(event.startTime);
    form.endTime.value = toDatetimeLocalValue(event.endTime);
    form.location.value = event.location || '';
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
  errorBox.textContent = '';
  if (!title) {
    errorBox.textContent = 'Введите название мероприятия';
    return;
  }
  if (!startTime) {
    errorBox.textContent = 'Выберите дату начала';
    return;
  }
  try {
    await updateEvent(eventId, {
      title,
      description,
      startTime,
      endTime,
      location,
    });
    window.location.href = '/events.html';
  } catch (error) {
    errorBox.textContent = error.message;
  }
});

loadEvent();
