import { getPosts } from '../../api/posts.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { createPostCard } from '../../components/post/postCard.js';
import { getCurrentUser } from '../../utils/storage.js';

const sidebarContainer = document.getElementById('sidebar');
const postsContainer = document.getElementById('posts');
const loadMoreButton = document.getElementById('load-more-btn');
const searchInput = document.getElementById('feed-search');
const postsEmpty = document.getElementById('posts-empty');
const createPostLink = document.getElementById('create-post-link');

let currentPage = 1;
const limit = 2;
let loadedPosts = [];

renderSidebar(sidebarContainer);

function renderPosts(posts) {
  postsContainer.innerHTML = '';

  if (posts.length === 0) {
    postsEmpty.style.display = 'block';
    return;
  }
  postsEmpty.style.display = 'none';
  posts.forEach((post) => {
    postsContainer.appendChild(createPostCard(post));
  });
}

const currentUser = getCurrentUser();
if (!currentUser) {
  createPostLink.style.display = 'none';
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
