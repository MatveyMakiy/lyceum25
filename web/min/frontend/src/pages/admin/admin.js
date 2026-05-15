import {
  adminDeleteComment,
  adminDeleteEvent,
  adminDeleteGroup,
  adminDeletePost,
  getAdminContent,
  getAdminStats,
} from '../../api/admin.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

if (currentUser.role !== 'admin') {
  window.location.href = '/feed.html';
}

const sidebarContainer = document.getElementById('sidebar');
const adminStatus = document.getElementById('admin-status');
const adminContent = document.getElementById('admin-content');

const statsUsers = document.getElementById('stats-users');
const statsGroups = document.getElementById('stats-groups');
const statsPosts = document.getElementById('stats-posts');
const statsComments = document.getElementById('stats-comments');
const statsEvents = document.getElementById('stats-events');
const statsChats = document.getElementById('stats-chats');

const adminPosts = document.getElementById('admin-posts');
const adminComments = document.getElementById('admin-comments');
const adminGroups = document.getElementById('admin-groups');
const adminEvents = document.getElementById('admin-events');

renderSidebar(sidebarContainer);

function showStatus(message) {
  adminStatus.textContent = message;
  adminStatus.style.display = 'block';
}

function hideStatus() {
  adminStatus.textContent = '';
  adminStatus.style.display = 'none';
}

function formatDate(date) {
  return new Date(date).toLocaleString('ru-RU');
}

function getUserName(user) {
  if (!user) {
    return 'Неизвестный пользователь';
  }
  return `${user.firstName} ${user.lastName}`;
}

function createAdminItem({ title, meta, text, onDelete }) {
  const item = document.createElement('article');
  item.className = 'admin-item';
  const content = document.createElement('div');
  content.innerHTML = `
    <p class="admin-item__title">${title}</p>
    <p class="admin-item__meta">${meta}</p>
    ${text ? `<p class="admin-item__text">${text}</p>` : ''}
  `;
  const deleteButton = document.createElement('button');
  deleteButton.className = 'admin-item__delete';
  deleteButton.type = 'button';
  deleteButton.textContent = 'Удалить';
  deleteButton.addEventListener('click', async () => {
    const isConfirmed = window.confirm('Удалить запись?');
    if (!isConfirmed) {
      return;
    }
    try {
      await onDelete();
      await loadAdminPage();
    } catch (error) {
      showStatus(error.message);
    }
  });
  item.append(content, deleteButton);
  return item;
}

function renderStats(stats) {
  statsUsers.textContent = stats.usersCount;
  statsGroups.textContent = stats.groupsCount;
  statsPosts.textContent = stats.postsCount;
  statsComments.textContent = stats.commentsCount;
  statsEvents.textContent = stats.eventsCount;
  statsChats.textContent = stats.chatsCount;
}

function renderPosts(posts) {
  adminPosts.innerHTML = '';
  if (posts.length === 0) {
    adminPosts.textContent = 'Постов пока нет';
    return;
  }
  posts.forEach((post) => {
    adminPosts.appendChild(
      createAdminItem({
        title: `Пост от ${getUserName(post.author)}`,
        meta: `${formatDate(post.createdAt)}${
          post.group ? ` · ${post.group.name}` : ''
        }`,
        text: post.content,
        onDelete: () => adminDeletePost(post.id),
      }),
    );
  });
}

function renderComments(comments) {
  adminComments.innerHTML = '';
  if (comments.length === 0) {
    adminComments.textContent = 'Комментариев пока нет';
    return;
  }
  comments.forEach((comment) => {
    adminComments.appendChild(
      createAdminItem({
        title: `Комментарий от ${getUserName(comment.author)}`,
        meta: formatDate(comment.createdAt),
        text: comment.content,
        onDelete: () => adminDeleteComment(comment.id),
      }),
    );
  });
}

function renderGroups(groups) {
  adminGroups.innerHTML = '';
  if (groups.length === 0) {
    adminGroups.textContent = 'Групп пока нет';
    return;
  }
  groups.forEach((group) => {
    adminGroups.appendChild(
      createAdminItem({
        title: group.name,
        meta: `Создатель: ${getUserName(group.creator)} · ${formatDate(
          group.createdAt,
        )}`,
        text: group.description || 'Описание не указано',
        onDelete: () => adminDeleteGroup(group.id),
      }),
    );
  });
}

function renderEvents(events) {
  adminEvents.innerHTML = '';
  if (events.length === 0) {
    adminEvents.textContent = 'Мероприятий пока нет';
    return;
  }
  events.forEach((event) => {
    adminEvents.appendChild(
      createAdminItem({
        title: event.title,
        meta: `${formatDate(event.startTime)} · ${
          event.isPublic ? 'Администрация' : event.group?.name || 'Без группы'
        }`,
        text: event.description || 'Описание не указано',
        onDelete: () => adminDeleteEvent(event.id),
      }),
    );
  });
}

async function loadAdminPage() {
  try {
    showStatus('Загрузка...');
    const [stats, content] = await Promise.all([
      getAdminStats(),
      getAdminContent(),
    ]);
    renderStats(stats);
    renderPosts(content.posts);
    renderComments(content.comments);
    renderGroups(content.groups);
    renderEvents(content.events);
    hideStatus();
    adminContent.style.display = 'block';
  } catch (error) {
    showStatus(error.message);
  }
}

loadAdminPage();