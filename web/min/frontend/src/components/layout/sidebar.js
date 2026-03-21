import { removeCurrentUser } from '../../utils/storage.js';

export function renderSidebar(container) {
  container.classList.add('sidebar');

  container.innerHTML = `
    <div class="sidebar__logo">Logo</div>

    <nav class="sidebar__nav">
      <a class="sidebar__link" href="/feed.html">Лента</a>
      <a class="sidebar__link" href="/profile.html">Профиль</a>
      <a class="sidebar__link" href="/groups.html">Группы</a>
      <a class="sidebar__link" href="/messages.html">Сообщения</a>
    </nav>

    <button class="sidebar__logout" id="logout-btn" type="button">Выйти</button>
  `;

  const logoutButton = document.getElementById('logout-btn');

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      removeCurrentUser();
      window.location.href = '/login.html';
    });
  }
}
