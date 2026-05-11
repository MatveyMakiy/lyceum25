import { deleteComment, createComment, getPostComments } from '../../api/comments.js';
import { getPostById, togglePostLike } from '../../api/posts.js';
import { renderSidebar } from '../../components/layout/sidebar.js';
import { createPostCard } from '../../components/post/postCard.js';
import { getCurrentUser } from '../../utils/storage.js';

const currentUser = getCurrentUser();

const sidebarContainer = document.getElementById('sidebar');
const commentsStatus = document.getElementById('comments-status');
const commentsPage = document.getElementById('comments-page');
const commentedPost = document.getElementById('commented-post');
const commentFormSection = document.getElementById('comment-form-section');
const commentForm = document.getElementById('comment-form');
const commentError = document.getElementById('comment-error');
const commentsEmpty = document.getElementById('comments-empty');
const commentsList = document.getElementById('comments-list');

const params = new URLSearchParams(window.location.search);
const postId = params.get('postId');

renderSidebar(sidebarContainer);

function showStatus(message) {
  commentsStatus.textContent = message;
  commentsStatus.style.display = 'block';
}

function hideStatus() {
  commentsStatus.textContent = '';
  commentsStatus.style.display = 'none';
}

function renderCommentedPost(post) {
  const normalizedPost = {
    id: post.id,
    authorId: post.author?.id || null,
    author: post.author
      ? `${post.author.firstName} ${post.author.lastName}`
      : 'Неизвестный автор',
    text: post.content,
    date: new Date(post.createdAt).toLocaleString('ru-RU'),
    group: post.group,
    likesCount: post._count?.likes || 0,
  };
  commentedPost.innerHTML = '';
  commentedPost.appendChild(
    createPostCard(normalizedPost,{
      onLike: togglePostLike,
    })
  );
}

function createCommentCard(comment) {
  const card = document.createElement('article');
  card.className = 'comment-card';
  const authorName = comment.author
    ? `${comment.author.firstName} ${comment.author.lastName}`
    : 'Неизвестный автор';
  const isOwnComment = currentUser && currentUser.id === comment.author.id;
  card.innerHTML = `
    <div class="comment-card__top">
      <a class="comment-card__author" href="/user-profile.html?id=${comment.author.id}">
        ${authorName}
      </a>
      <span class="comment-card__date">
        ${new Date(comment.createdAt).toLocaleString('ru-RU')}
      </span>
    </div>

    <div class="comment-card__text">${comment.content}</div>
  `;

  if (isOwnComment) {
    const actions = document.createElement('div');
    actions.className = 'comment-card__actions';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'comment-card__action';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Удалить';
    deleteButton.addEventListener('click', async () => {
      const isConfirmed = window.confirm('Удалить этот комментарий?');
      if (!isConfirmed) {
        return;
      }
      try {
        await deleteComment(comment.id);
        await loadComments();
      } catch (error) {
        commentError.textContent = error.message;
      }
    });
    actions.appendChild(deleteButton);
    card.appendChild(actions);
  }
  return card;
}

function renderComments(comments) {
  commentsList.innerHTML = '';
  if (comments.length === 0) {
    commentsEmpty.style.display = 'block';
    return;
  }
  commentsEmpty.style.display = 'none';
  comments.forEach((comment) => {
    commentsList.appendChild(createCommentCard(comment));
  });
}

async function loadComments() {
  try {
    const comments = await getPostComments(postId);
    renderComments(comments);
  } catch (error) {
    showStatus(error.message);
  }
}

async function loadPage() {
  if (!postId) {
    showStatus('Пост не найден');
    return;
  }
  try {
    showStatus('Загрузка...');
    const post = await getPostById(postId);
    renderCommentedPost(post);
    if (!currentUser) {
      commentFormSection.style.display = 'none';
    }
    await loadComments();
    hideStatus();
    commentsPage.style.display = 'block';
  } catch (error) {
    showStatus(error.message);
  }
}

commentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const content = commentForm.content.value.trim();
  commentError.textContent = '';
  if (!content) {
    commentError.textContent = 'Введите текст комментария';
    return;
  }
  try {
    await createComment(postId, content);
    commentForm.reset();
    await loadComments();
  } catch (error) {
    commentError.textContent = error.message;
  }
});

loadPage();