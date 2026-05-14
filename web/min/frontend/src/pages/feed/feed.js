import { getFeedEvents } from '../../api/events.js';
import { deletePost, getPosts, togglePostLike } from '../../api/posts.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { createPostCard } from '../../components/post/postCard.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

const sidebarContainer = document.getElementById('sidebar');
const postsContainer = document.getElementById('posts');
const postsStatus = document.getElementById('posts-status');
const loadMoreButton = document.getElementById('load-more-btn');
const searchInput = document.getElementById('feed-search');
const createPostLink = document.getElementById('create-post-link');
const feedEventsStatus = document.getElementById('feed-events-status');
const feedEventsList = document.getElementById('feed-events-list');

let currentPage = 1;
const limit = 2;
let currentSearch = '';
let loadedPosts = [];

renderSidebar(sidebarContainer);

if (!currentUser && createPostLink) {
  createPostLink.style.display = 'none';
}

if (!currentUser && searchInput) {
  searchInput.style.display = 'none';
}

if (!currentUser && loadMoreButton) {
  loadMoreButton.style.display = 'none';
}

function showStatus(message) {
  postsStatus.textContent = message;
  postsStatus.style.display = 'block';
}

function hideStatus() {
  postsStatus.textContent = '';
  postsStatus.style.display = 'none';
}

function showEventsStatus(message) {
  feedEventsStatus.textContent = message;
  feedEventsStatus.style.display = 'block';
}

function hideEventsStatus() {
  feedEventsStatus.textContent = '';
  feedEventsStatus.style.display = 'none';
}

function formatDate(date) {
  return new Date(date).toLocaleString('ru-RU');
}

function createFeedEventCard(event) {
  const card = document.createElement('article');
  card.className = 'feed-event-card';
  card.innerHTML = `
    <h3 class="feed-event-card__title">${event.title}</h3>
    <div class="feed-event-card__meta">
      <span>Дата: ${formatDate(event.startTime)}</span>
      <span>Группа: ${
        event.group?.name || (event.isPublic ? 'Администрация' : 'Не указана')
      }</span>
      <span>Место: ${event.location || 'Не указано'}</span>
    </div>
  `;
  return card;
}
function renderFeedEvents(events) {
  feedEventsList.innerHTML = '';
  if (events.length === 0) {
    showEventsStatus('Пока нет ближайших публичных мероприятий');
    return;
  }
  hideEventsStatus();
  events.forEach((event) => {
    feedEventsList.appendChild(createFeedEventCard(event));
  });
}

async function loadFeedEvents() {
  try {
    showEventsStatus('Загрузка мероприятий...');
    const events = await getFeedEvents(3);
    renderFeedEvents(events);
  } catch (error) {
    showEventsStatus(error.message);
  }
}

function renderPosts(posts) {
  postsContainer.innerHTML = '';

  posts.forEach((post) => {
    postsContainer.appendChild(
      createPostCard(post, {
        onDelete: handleDeletePost,
        onLike: togglePostLike,
      }),
    );
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
    showStatus(
      'В вашей ленте пока нет публикаций и мероприятий. Вступите в группы, чтобы видеть их новости.',
    );
  }
}

async function loadPage() {
  try {
    if (currentPage === 1) {
      showStatus('Загрузка публикаций...');
      postsContainer.innerHTML = '';
    }
    loadMoreButton.disabled = true;
    const result = await getPosts(currentPage, limit, currentSearch);
    loadedPosts = [...loadedPosts, ...result.items];
    renderPosts(loadedPosts);
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

function resetFeed() {
  currentPage = 1;
  loadedPosts = [];
  loadMoreButton.style.display = 'block';
  loadPage();
}

async function handleDeletePost(id) {
  try {
    await deletePost(id);
    resetFeed();
  } catch (error) {
    showStatus(error.message);
  }
}

if (currentUser) {
  searchInput.addEventListener('input', (event) => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      currentSearch = event.target.value.trim();
      resetFeed();
    }, 300);
  });
  loadMoreButton.addEventListener('click', loadPage);
}

let searchTimeout;
loadFeedEvents();

if (currentUser) {
  loadPage();
} else {
  showStatus('Войдите, чтобы видеть публикации ваших сообществ.');
}