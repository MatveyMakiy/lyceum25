import { deletePost, getPosts, togglePostLike } from '../../api/posts.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { createPostCard } from '../../components/post/postCard.js';
import { getCurrentUser } from '../../utils/storage.js';

const sidebarContainer = document.getElementById('sidebar');
const postsContainer = document.getElementById('posts');
const postsStatus = document.getElementById('posts-status');
const loadMoreButton = document.getElementById('load-more-btn');
const searchInput = document.getElementById('feed-search');
const createPostLink = document.getElementById('create-post-link');

let currentPage = 1;
const limit = 2;
let currentSearch = '';
let loadedPosts = [];

renderSidebar(sidebarContainer);

const currentUser = getCurrentUser();

if (!currentUser && createPostLink) {
  createPostLink.style.display = 'none';
}

function showStatus(message) {
  postsStatus.textContent = message;
  postsStatus.style.display = 'block';
}

function hideStatus() {
  postsStatus.textContent = '';
  postsStatus.style.display = 'none';
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
    showStatus('Пока публикаций нет');
  }
}

async function handleDeletePost(id) {
  try {
    await deletePost(id);
    resetFeed();
  } catch (error) {
    showStatus(error.message);
  }
}

async function loadPage() {
  try {
    if (currentPage === 1) {
      showStatus('Загрузка...');
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

let searchTimeout;

searchInput.addEventListener('input', (event) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = event.target.value.trim();
    resetFeed();
  }, 300);
});

loadMoreButton.addEventListener('click', loadPage);

loadPage();