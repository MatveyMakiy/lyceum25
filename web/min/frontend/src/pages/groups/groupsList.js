import { getGroups } from '../../api/groups.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const groupsList = document.getElementById('groups-list');
const groupsStatus = document.getElementById('groups-status');
const loadMoreButton = document.getElementById('load-more-groups-btn');
const searchInput = document.getElementById('groups-search');

let currentPage = 1;
const limit = 6;
let currentSearch = '';
let loadedGroups = [];

renderSidebar(sidebarContainer);

function showStatus(message) {
  groupsStatus.textContent = message;
  groupsStatus.style.display = 'block';
}

function hideStatus() {
  groupsStatus.textContent = '';
  groupsStatus.style.display = 'none';
}

function createGroupCard(group) {
  const card = document.createElement('a');

  card.className = 'group-card';
  card.href = `/group.html?id=${group.id}`;

  const creatorName = group.creator
    ? `${group.creator.firstName} ${group.creator.lastName}`
    : 'Неизвестный автор';

  card.innerHTML = `
    <h2 class="group-card__name">${group.name}</h2>
    <p class="group-card__description">
      ${group.description || 'Описание пока не добавлено'}
    </p>
    <p class="group-card__creator">Создатель: ${creatorName}</p>
  `;

  return card;
}

function renderGroups(groups) {
  groupsList.innerHTML = '';

  groups.forEach((group) => {
    groupsList.appendChild(createGroupCard(group));
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
    showStatus('Групп пока нет');
  }
}

async function loadPage() {
  try {
    if (currentPage === 1) {
      showStatus('Загрузка...');
      groupsList.innerHTML = '';
    }

    loadMoreButton.disabled = true;

    const result = await getGroups(currentPage, limit, currentSearch);

    loadedGroups = [...loadedGroups, ...result.items];
    renderGroups(loadedGroups);
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

function resetGroups() {
  currentPage = 1;
  loadedGroups = [];
  loadMoreButton.style.display = 'block';
  loadPage();
}

let searchTimeout;

searchInput.addEventListener('input', (event) => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    currentSearch = event.target.value.trim();
    resetGroups();
  }, 300);
});

loadMoreButton.addEventListener('click', loadPage);

loadPage();
