export function createPostCard(post, options = {}) {
  const { onDelete, onLike } = options;
  const article = document.createElement('article');
  article.className = 'post-card';
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const isOwnPost = currentUser && currentUser.id === post.authorId;
  article.innerHTML = `
    <div class="post-card__top">
      <div>
        ${
          post.authorId
            ? `<a class="post-card__author" href="/user-profile.html?id=${post.authorId}">${post.author}</a>`
            : `<span class="post-card__author">${post.author}</span>`
        }

        ${
          post.group
            ? `<span class="post-card__group">в группе «${post.group.name}»</span>`
            : ''
        }
      </div>

      <span class="post-card__date">${post.date}</span>
    </div>

    <div class="post-card__text">${post.text}</div>

    <div class="post-card__bottom">
      <button class="post-card__like" type="button">
        Нравится · <span>${post.likesCount || 0}</span>
      </button>

      <a class="post-card__comments-link" href="/comments.html?postId=${post.id}">
        Комментарии
      </a>
    </div>
  `;

  const likeButton = article.querySelector('.post-card__like');
  const likeCounter = likeButton.querySelector('span');

  if (!currentUser) {
    likeButton.disabled = true;
    likeButton.title = 'Войдите, чтобы поставить лайк';
  }

  likeButton.addEventListener('click', async () => {
    if (!currentUser || !onLike) {
      return;
    }
    try {
      likeButton.disabled = true;
      const result = await onLike(post.id);
      likeCounter.textContent = result.likesCount;
    } finally {
      likeButton.disabled = false;
    }
  });

  if (isOwnPost) {
    const actions = document.createElement('div');
    actions.className = 'post-card__actions';
    const editLink = document.createElement('a');
    editLink.className = 'post-card__action';
    editLink.href = `/edit-post.html?id=${post.id}`;
    editLink.textContent = 'Редактировать';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'post-card__action';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Удалить';
    deleteButton.addEventListener('click', async () => {
      const isConfirmed = window.confirm('Удалить этот пост?');
      if (!isConfirmed || !onDelete) {
        return;
      }
      await onDelete(post.id);
    });
    actions.append(editLink, deleteButton);
    article.appendChild(actions);
  }
  return article;
}