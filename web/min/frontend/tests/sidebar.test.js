import { beforeEach, describe, expect, it } from 'vitest';
import { renderSidebar } from '../src/components/layout/sidebar.js';

describe('renderSidebar', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    document.body.innerHTML = '<aside id="sidebar"></aside>';
  });
  it('renders guest sidebar', () => {
    const sidebar = document.getElementById('sidebar');
    renderSidebar(sidebar);
    expect(sidebar.textContent).toContain('Лента');
    expect(sidebar.textContent).toContain('Войти');
    expect(sidebar.textContent).toContain('Регистрация');
    expect(sidebar.textContent).toContain('Тёмная тема');
    expect(sidebar.textContent).not.toContain('Выйти');
  });
  it('renders user sidebar', () => {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: 'user-1',
        role: 'user',
      }),
    );
    const sidebar = document.getElementById('sidebar');
    renderSidebar(sidebar);
    expect(sidebar.textContent).toContain('Лента');
    expect(sidebar.textContent).toContain('Профиль');
    expect(sidebar.textContent).toContain('Группы');
    expect(sidebar.textContent).toContain('Пользователи');
    expect(sidebar.textContent).toContain('Мероприятия');
    expect(sidebar.textContent).toContain('Сообщения');
    expect(sidebar.textContent).toContain('Выйти');
    expect(sidebar.textContent).not.toContain('Админка');
  });
  it('renders admin link for admin user', () => {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: 'admin-1',
        role: 'admin',
      }),
    );
    const sidebar = document.getElementById('sidebar');
    renderSidebar(sidebar);
    expect(sidebar.textContent).toContain('Админка');
  });
  it('toggles theme from sidebar button', () => {
    const sidebar = document.getElementById('sidebar');
    renderSidebar(sidebar);
    const themeButton = document.getElementById('theme-toggle-btn');
    expect(themeButton.textContent).toBe('Тёмная тема');
    themeButton.click();
    expect(document.body.classList.contains('dark-theme')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(themeButton.textContent).toBe('Светлая тема');
  });
});
