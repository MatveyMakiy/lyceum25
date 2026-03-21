export function renderSidebar(container) {
  container.innerHTML = `
    <div class="sidebar">
      <div class="sidebar__logo">Logo</div>
      <nav class="sidebar__nav">
        <a class="sidebar__link" href="/feed.html">Лента</a>
        <a class="sidebar__link" href="/login.html">Вход</a>
        <a class="sidebar__link" href="/register.html">Регистрация</a>
      </nav>
    </div>
  `;
}