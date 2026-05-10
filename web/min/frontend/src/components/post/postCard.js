export function createPostCard(post, options = {}) {
  const { onDelete } = options;

  const article = document.createElement('article');
  article.className = 'post-card';

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const isOwnPost = currentUser && currentUser.id === post.authorId;

  article.innerHTML = `
    <div class="post-card__top">
      <div>
        <span class="post-card__author">${post.author}</span>
        ${
          post.group
            ? `<span class="post-card__group">в группе «${post.group.name}»</span>`
            : ''
        }
      </div>

      <span class="post-card__date">${post.date}</span>
    </div>

    <div class="post-card__text">${post.text}</div>
  `;

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