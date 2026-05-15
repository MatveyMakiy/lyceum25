import { createPost } from '../../api/posts.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const form = document.getElementById('create-post-form');
const errorBox = document.getElementById('create-post-error');

renderSidebar(sidebarContainer);

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const content = form.content.value.trim();

  errorBox.textContent = '';

  if (!content) {
    errorBox.textContent = 'Введите текст поста';
    return;
  }

  try {
    await createPost(content);
    window.location.href = '/feed.html';
  } catch (error) {
    errorBox.textContent = error.message;
  }
});
