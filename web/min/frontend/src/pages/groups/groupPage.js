import { getGroupById, joinGroup, leaveGroup } from '../../api/groups.js';
import { createPost } from '../../api/posts.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { createPostCard } from '../../components/post/postCard.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

if (!currentUser) {
  window.location.href = '/login.html';
}

const sidebarContainer = document.getElementById('sidebar');
const groupStatus = document.getElementById('group-status');
const groupContent = document.getElementById('group-content');
const groupName = document.getElementById('group-name');
const groupDescription = document.getElementById('group-description');
const groupCreator = document.getElementById('group-creator');
const groupMembersCount = document.getElementById('group-members-count');
const membershipButton = document.getElementById('group-membership-btn');
const groupPosts = document.getElementById('group-posts');
const groupPostsEmpty = document.getElementById('group-posts-empty');
const postForm = document.getElementById('group-post-form');
const postError = document.getElementById('group-post-error');

const params = new URLSearchParams(window.location.search);
const groupId = params.get('id');

renderSidebar(sidebarContainer);

function showStatus(message) {
  groupStatus.textContent = message;
  groupStatus.style.display = 'block';
}

function hideStatus() {
  groupStatus.textContent = '';
  groupStatus.style.display = 'none';
}

function updateMembershipButton(membership) {
  if (!membership) {
    membershipButton.textContent = 'Вступить';
    membershipButton.disabled = false;
    membershipButton.dataset.action = 'join';
    return;
  }
  if (membership.role === 'admin') {
    membershipButton.textContent = 'Вы администратор группы';
    membershipButton.disabled = true;
    membershipButton.dataset.action = '';
    return;
  }
  membershipButton.textContent = 'Выйти';
  membershipButton.disabled = false;
  membershipButton.dataset.action = 'leave';
}

function renderPosts(posts) {
  groupPosts.innerHTML = '';

  if (posts.length === 0) {
    groupPostsEmpty.style.display = 'block';
    return;
  }

  groupPostsEmpty.style.display = 'none';

  posts.forEach((post) => {
    const normalizedPost = {
      id: post.id,
      author: post.author
        ? `${post.author.firstName} ${post.author.lastName}`
        : 'Неизвестный автор',
      text: post.content,
      date: new Date(post.createdAt).toLocaleString('ru-RU'),
    };

    groupPosts.appendChild(createPostCard(normalizedPost));
  });
}

async function loadGroup() {
  if (!groupId) {
    showStatus('Группа не найдена');
    return;
  }

  try {
    showStatus('Загрузка...');

    const group = await getGroupById(groupId);

    const creatorName = group.creator
      ? `${group.creator.firstName} ${group.creator.lastName}`
      : 'Неизвестный создатель';

    groupName.textContent = group.name;
    groupDescription.textContent =
      group.description || 'Описание пока не добавлено';
    groupCreator.textContent = `Создатель: ${creatorName}`;
    groupMembersCount.textContent = `Участников: ${group._count.members}`;

    updateMembershipButton(group.members[0]);
    renderPosts(group.posts);

    hideStatus();
    groupContent.style.display = 'block';
  } catch (error) {
    showStatus(error.message);
  }
}

postForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const content = postForm.content.value.trim();

  postError.textContent = '';

  if (!content) {
    postError.textContent = 'Введите текст поста';
    return;
  }

  try {
    await createPost(content, groupId);
    postForm.reset();
    await loadGroup();
  } catch (error) {
    postError.textContent = error.message;
  }
});

membershipButton.addEventListener('click', async () => {
  const action = membershipButton.dataset.action;
  try {
    membershipButton.disabled = true;
    if (action === 'join') {
      await joinGroup(groupId);
    }
    if (action === 'leave') {
      await leaveGroup(groupId);
    }
    await loadGroup();
  } catch (error) {
    showStatus(error.message);
    membershipButton.disabled = false;
  }
});

loadGroup();