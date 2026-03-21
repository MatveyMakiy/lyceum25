export function createPostCard(post) {
  const article = document.createElement("article");
  article.className = "post-card";

  article.innerHTML = `
    <div class="post-card__top">
      <span class="post-card__author">${post.author}</span>
      <span class="post-card__date">${post.date}</span>
    </div>
    <div class="post-card__text">${post.text}</div>
  `;

  return article;
}