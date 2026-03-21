import { getPosts } from '../../api/posts.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { createPostCard } from '../../components/post/postCard.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const postsContainer = document.getElementById('posts');
const loadMoreButton = document.getElementById('load-more-btn');
const searchInput = document.getElementById('feed-search');

let currentPage = 1;
const limit = 2;
let loadedPosts = [];

renderSidebar(sidebarContainer);

function renderPosts(posts) {
  postsContainer.innerHTML = '';

  posts.forEach((post) => {
    postsContainer.appendChild(createPostCard(post));
  });
}

function filterPosts(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    renderPosts(loadedPosts);
    return;
  }

  const filteredPosts = loadedPosts.filter((post) => {
    return (
      post.author.toLowerCase().includes(normalizedQuery) ||
      post.text.toLowerCase().includes(normalizedQuery)
    );
  });

  renderPosts(filteredPosts);
}

async function loadPage() {
  const result = await getPosts(currentPage, limit);

  loadedPosts = [...loadedPosts, ...result.items];
  renderPosts(loadedPosts);

  if (!result.hasMore) {
    loadMoreButton.style.display = 'none';
  }

  currentPage += 1;
}

loadMoreButton.addEventListener('click', loadPage);

searchInput.addEventListener('input', (event) => {
  filterPosts(event.target.value);
});

loadPage();
