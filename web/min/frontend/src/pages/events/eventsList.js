import {
  deleteEvent,
  getEvents,
  joinEvent,
  leaveEvent,
} from '../../api/events.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const eventsList = document.getElementById('events-list');
const eventsStatus = document.getElementById('events-status');
const loadMoreButton = document.getElementById('load-more-events-btn');
const searchInput = document.getElementById('events-search');

let currentPage = 1;
const limit = 6;
let currentSearch = '';
let loadedEvents = [];

renderSidebar(sidebarContainer);

function showStatus(message) {
  eventsStatus.textContent = message;
  eventsStatus.style.display = 'block';
}

function hideStatus() {
  eventsStatus.textContent = '';
  eventsStatus.style.display = 'none';
}

function formatDate(date) {
  return new Date(date).toLocaleString('ru-RU');
}

async function handleJoinEvent(eventId) {
  try {
    await joinEvent(eventId);
    resetEvents();
  } catch (error) {
    showStatus(error.message);
  }
}

async function handleLeaveEvent(eventId) {
  try {
    await leaveEvent(eventId);
    resetEvents();
  } catch (error) {
    showStatus(error.message);
  }
}

function createEventCard(event) {
  const card = document.createElement('article');
  card.className = 'event-card';
  const creatorName = event.creator
    ? `${event.creator.firstName} ${event.creator.lastName}`
    : 'Неизвестный автор';
  card.innerHTML = `
    <h2 class="event-card__title">${event.title}</h2>

    <p class="event-card__description">
      ${event.description || 'Описание пока не добавлено'}
    </p>

    <div class="event-card__meta">
      <span>Начало: ${formatDate(event.startTime)}</span>
      ${
        event.endTime
          ? `<span>Окончание: ${formatDate(event.endTime)}</span>`
          : ''
      }
      <span>Место: ${event.location || 'Не указано'}</span>
      <span>Группа: ${event.group?.name || 'Не указана'}</span>
      <span>Создатель: ${creatorName}</span>
      <span>Участников: ${event.participantsCount || 0}</span>
    </div>
  `;
  const actions = document.createElement('div');
  actions.className = 'event-card__actions';
  const participantButton = document.createElement('button');
  participantButton.className = 'event-card__action';
  participantButton.type = 'button';
  if (event.isParticipating) {
    participantButton.textContent = 'Отменить запись';
    participantButton.addEventListener('click', () => {
      handleLeaveEvent(event.id);
    });
  } else {
    participantButton.textContent = 'Записаться';
    participantButton.addEventListener('click', () => {
      handleJoinEvent(event.id);
    });
  }
  actions.appendChild(participantButton);
  if (event.canManage) {
    const editLink = document.createElement('a');
    editLink.className = 'event-card__action';
    editLink.href = `/edit-event.html?id=${event.id}`;
    editLink.textContent = 'Редактировать';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'event-card__action';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Удалить';
    deleteButton.addEventListener('click', async () => {
      const isConfirmed = window.confirm('Удалить это мероприятие?');
      if (!isConfirmed) {
        return;
      }
      try {
        await deleteEvent(event.id);
        resetEvents();
      } catch (error) {
        showStatus(error.message);
      }
    });
    actions.append(editLink, deleteButton);
  }
  card.appendChild(actions);
  return card;
}

function renderEvents(events) {
  eventsList.innerHTML = '';
  events.forEach((event) => {
    eventsList.appendChild(createEventCard(event));
  });
}

function updateEmptyState(total) {
  if (total > 0) {
    hideStatus();
    return;
  }

  if (currentSearch) {
    showStatus('По вашему запросу ничего не найдено');
  } else {
    showStatus('Мероприятий пока нет');
  }
}

async function loadPage() {
  try {
    if (currentPage === 1) {
      showStatus('Загрузка...');
      eventsList.innerHTML = '';
    }
    loadMoreButton.disabled = true;
    const result = await getEvents(currentPage, limit, currentSearch);
    loadedEvents = [...loadedEvents, ...result.items];
    renderEvents(loadedEvents);
    updateEmptyState(result.total);
    loadMoreButton.style.display = result.hasMore ? 'block' : 'none';
    currentPage += 1;
  } catch (error) {
    showStatus(error.message);
    loadMoreButton.style.display = 'none';
  } finally {
    loadMoreButton.disabled = false;
  }
}

function resetEvents() {
  currentPage = 1;
  loadedEvents = [];
  loadMoreButton.style.display = 'block';
  loadPage();
}

let searchTimeout;

searchInput.addEventListener('input', (event) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = event.target.value.trim();
    resetEvents();
  }, 300);
});

loadMoreButton.addEventListener('click', loadPage);

loadPage();
