import { getPostById, updatePost } from '../../api/posts.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const form = document.getElementById('edit-post-form');
const errorBox = document.getElementById('edit-post-error');
const cancelButton = document.getElementById('cancel-edit-btn');

const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

let returnUrl = '/feed.html';
renderSidebar(sidebarContainer);
async function loadPost() {
  if (!postId) {
    errorBox.textContent = 'Пост не найден';
    return;
  }
  try {
    const post = await getPostById(postId);
    if (post.author.id !== currentUser.id) {
      errorBox.textContent = 'Редактировать можно только свои посты';
      form.querySelector('button[type="submit"]').disabled = true;
      return;
    }
    form.content.value = post.content;
    if (post.group) {
      returnUrl = `/group.html?id=${post.group.id}`;
    }
  } catch (error) {
    errorBox.textContent = error.message;
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const content = form.content.value.trim();
  errorBox.textContent = '';
  if (!content) {
    errorBox.textContent = 'Введите текст поста';
    return;
  }
  try {
    await updatePost(postId, content);
    window.location.href = returnUrl;
  } catch (error) {
    errorBox.textContent = error.message;
  }
});

cancelButton.addEventListener('click', () => {
  window.location.href = returnUrl;
});

loadPost();