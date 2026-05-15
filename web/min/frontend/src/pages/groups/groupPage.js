import {
  getGroupById,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  updateGroupMemberRole,
} from '../../api/groups.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { createPost, deletePost, togglePostLike } from '../../api/posts.js';
import { getCurrentUser } from '../../utils/storage.js';
import { createPostCard } from '../../components/post/postCard.js';
import { getOrCreateGroupChat } from '../../api/chats.js';

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
const postFormSection = document.getElementById('group-post-form-section');
const groupPosts = document.getElementById('group-posts');
const groupPostsEmpty = document.getElementById('group-posts-empty');
const postForm = document.getElementById('group-post-form');
const postError = document.getElementById('group-post-error');
const groupMembersList = document.getElementById('group-members-list');
const groupMembersError = document.getElementById('group-members-error');
const groupChatButton = document.getElementById('group-chat-btn');
const editGroupLink = document.getElementById('edit-group-link');

const params = new URLSearchParams(window.location.search);
const groupId = params.get('id');

let currentMembership = null;

renderSidebar(sidebarContainer);

function showStatus(message) {
  groupStatus.textContent = message;
  groupStatus.style.display = 'block';
}

function hideStatus() {
  groupStatus.textContent = '';
  groupStatus.style.display = 'none';
}

function getRoleLabel(role) {
  if (role === 'admin') {
    return 'Администратор';
  }
  if (role === 'moderator') {
    return 'Модератор';
  }
  return 'Участник';
}

function updateEditGroupLink(membership) {
  if (membership?.role !== 'admin') {
    editGroupLink.style.display = 'none';
    return;
  }
  editGroupLink.href = `/edit-group.html?id=${groupId}`;
  editGroupLink.style.display = 'block';
}

function updateGroupChatButton(membership) {
  if (!membership) {
    groupChatButton.style.display = 'none';
    return;
  }
  groupChatButton.style.display = 'block';
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

function updatePostFormVisibility(membership) {
  const canCreatePosts = ['admin', 'moderator'].includes(membership?.role);
  postFormSection.style.display = canCreatePosts ? 'block' : 'none';
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
      authorId: post.author?.id || null,
      author: post.author
        ? `${post.author.firstName} ${post.author.lastName}`
        : 'Неизвестный автор',
      text: post.content,
      date: new Date(post.createdAt).toLocaleString('ru-RU'),
      likesCount: post._count?.likes || 0,
    };
    groupPosts.appendChild(
      createPostCard(normalizedPost, {
        onDelete: handleDeletePost,
        onLike: togglePostLike,
      }),
    );
  });
}

function renderMembers(members) {
  groupMembersList.innerHTML = '';
  members.forEach((member) => {
    const card = document.createElement('div');
    card.className = 'group-member-card';
    const fullName = `${member.user.firstName} ${member.user.lastName}`;
    const isAdminViewer = currentMembership?.role === 'admin';
    const isTargetAdmin = member.role === 'admin';
    card.innerHTML = `
      <div class="group-member-card__info">
        <p class="group-member-card__name">${fullName}</p>
        <p class="group-member-card__role">${getRoleLabel(member.role)}</p>
      </div>
    `;
    if (isAdminViewer && !isTargetAdmin) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'group-member-card__action';
      if (member.role === 'moderator') {
        button.textContent = 'Снять модератора';
        button.dataset.role = 'member';
      } else {
        button.textContent = 'Сделать модератором';
        button.dataset.role = 'moderator';
      }
      button.addEventListener('click', async () => {
        try {
          button.disabled = true;
          await updateGroupMemberRole(
            groupId,
            member.user.id,
            button.dataset.role,
          );
          await loadMembers();
        } catch (error) {
          groupMembersError.textContent = error.message;
          button.disabled = false;
        }
      });
      card.appendChild(button);
    }
    groupMembersList.appendChild(card);
  });
}

async function loadMembers() {
  try {
    groupMembersError.textContent = '';
    const members = await getGroupMembers(groupId);
    renderMembers(members);
  } catch (error) {
    groupMembersError.textContent = error.message;
  }
}

async function loadGroup() {
  if (!groupId) {
    showStatus('Группа не найдена');
    return;
  }

  try {
    showStatus('Загрузка...');
    const group = await getGroupById(groupId);
    currentMembership = group.members[0] || null;
    const creatorName = group.creator
      ? `${group.creator.firstName} ${group.creator.lastName}`
      : 'Неизвестный создатель';

    groupName.textContent = group.name;
    groupDescription.textContent =
      group.description || 'Описание пока не добавлено';
    groupCreator.textContent = `Создатель: ${creatorName}`;
    groupMembersCount.textContent = `Участников: ${group._count.members}`;
    updateMembershipButton(currentMembership);
    updatePostFormVisibility(currentMembership);
    updateGroupChatButton(currentMembership);
    updateEditGroupLink(currentMembership);
    renderPosts(group.posts);
    await loadMembers();
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

async function handleDeletePost(id) {
  try {
    await deletePost(id);
    await loadGroup();
  } catch (error) {
    showStatus(error.message);
  }
}

groupChatButton.addEventListener('click', async () => {
  try {
    const chat = await getOrCreateGroupChat(groupId);
    window.location.href = `/chat.html?id=${chat.id}`;
  } catch (error) {
    showStatus(error.message);
  }
});

loadGroup();
