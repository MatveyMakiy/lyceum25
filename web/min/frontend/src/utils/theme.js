const THEME_KEY = 'theme';

export function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

export function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  return isDark ? 'dark' : 'light';
}

export function getCurrentTheme() {
  return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
}
