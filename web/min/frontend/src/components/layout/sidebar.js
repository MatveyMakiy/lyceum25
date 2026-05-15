import { getCurrentUser, removeCurrentUser } from '../../utils/storage.js';
import {
  applySavedTheme,
  getCurrentTheme,
  toggleTheme,
} from '../../utils/theme.js';

export function renderSidebar(container) {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  applySavedTheme();
  container.classList.add('sidebar');
  if (!currentUser) {
    container.innerHTML = `
      <div class="sidebar__logo">Logo</div>

      <nav class="sidebar__nav">
        <a class="sidebar__link" href="/feed.html">Лента</a>
      </nav>

      <div class="sidebar__bottom">
        <button class="sidebar__theme" id="theme-toggle-btn" type="button">
          Сменить тему
        </button>
        <a class="sidebar__link" href="/login.html">Войти</a>
        <a class="sidebar__link" href="/register.html">Регистрация</a>
      </div>
    `;
    setupThemeButton();
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
        isAdmin ? '<a class="sidebar__link" href="/admin.html">Админка</a>' : ''
      }
    </nav>
    <div class="sidebar__bottom">
      <button class="sidebar__theme" id="theme-toggle-btn" type="button">
        Сменить тему
      </button>
      <button class="sidebar__logout" id="logout-btn" type="button">
        Выйти
      </button>
    </div>
  `;
  setupThemeButton();
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      removeCurrentUser();
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    });
  }
}

function setupThemeButton() {
  const themeButton = document.getElementById('theme-toggle-btn');
  if (!themeButton) {
    return;
  }
  function updateThemeButtonText() {
    themeButton.textContent =
      getCurrentTheme() === 'dark' ? 'Светлая тема' : 'Тёмная тема';
  }
  updateThemeButtonText();
  themeButton.addEventListener('click', () => {
    toggleTheme();
    updateThemeButtonText();
  });
}
