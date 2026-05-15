import { getCurrentUser, removeCurrentUser } from '../../utils/storage.js';

export function renderSidebar(container) {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  container.classList.add('sidebar');

  if (!currentUser) {
    container.innerHTML = `
      <div class="sidebar__logo">Logo</div>

      <nav class="sidebar__nav">
        <a class="sidebar__link" href="/feed.html">Лента</a>
      </nav>

      <div class="sidebar__auth">
        <a class="sidebar__link" href="/login.html">Войти</a>
        <a class="sidebar__link" href="/register.html">Регистрация</a>
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="sidebar__logo">Logo</div>

    <nav class="sidebar__nav">
      <a class="sidebar__link" href="/feed.html">Лента</a>
      <a class="sidebar__link" href="/profile.html">Профиль</a>
      <a class="sidebar__link" href="/groups.html">Группы</a>
      <a class="sidebar__link" href="/users.html">Пользователи</a>
      <a class="sidebar__link" href="/events.html">Мероприятия</a>
      <a class="sidebar__link" href="/messages.html">Сообщения</a>
      ${
        isAdmin
          ? '<a class="sidebar__link" href="/admin.html">Админка</a>'
          : ''
        }
      </nav>

    <button class="sidebar__logout" id="logout-btn" type="button">Выйти</button>
  `;

  const logoutButton = document.getElementById('logout-btn');

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      removeCurrentUser();
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    });
  }
}