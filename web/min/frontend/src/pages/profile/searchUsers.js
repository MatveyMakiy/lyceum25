import { getUsers } from '../../api/users.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const usersList = document.getElementById('users-list');
const usersStatus = document.getElementById('users-status');
const loadMoreButton = document.getElementById('load-more-users-btn');
const searchInput = document.getElementById('users-search');

let currentPage = 1;
const limit = 10;
let currentSearch = '';
let loadedUsers = [];

renderSidebar(sidebarContainer);

function showStatus(message) {
  usersStatus.textContent = message;
  usersStatus.style.display = 'block';
}

function hideStatus() {
  usersStatus.textContent = '';
  usersStatus.style.display = 'none';
}

function getInitials(firstName, lastName) {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

function createUserCard(user) {
  const card = document.createElement('a');
  card.className = 'user-card';
  if (user.id === currentUser.id) {
    card.href = '/profile.html';
  } else {
    card.href = `/user-profile.html?id=${user.id}`;
  }
  card.innerHTML = `
    <div class="user-card__avatar">
      ${getInitials(user.firstName, user.lastName)}
    </div>
    <div>
      <p class="user-card__name">${user.firstName} ${user.lastName}</p>
      <p class="user-card__class">${user.class || 'Класс не указан'}</p>
    </div>
  `;
  return card;
}

function renderUsers(users) {
  usersList.innerHTML = '';
  users.forEach((user) => {
    usersList.appendChild(createUserCard(user));
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
    showStatus('Пользователей пока нет');
  }
}

async function loadPage() {
  try {
    if (currentPage === 1) {
      showStatus('Загрузка...');
      usersList.innerHTML = '';
    }
    loadMoreButton.disabled = true;
    const result = await getUsers(currentPage, limit, currentSearch);
    loadedUsers = [...loadedUsers, ...result.items];
    renderUsers(loadedUsers);
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

function resetUsers() {
  currentPage = 1;
  loadedUsers = [];
  loadMoreButton.style.display = 'block';
  loadPage();
}

let searchTimeout;

searchInput.addEventListener('input', (event) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = event.target.value.trim();
    resetUsers();
  }, 300);
});

loadMoreButton.addEventListener('click', loadPage);

loadPage();
