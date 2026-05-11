const CURRENT_USER_KEY = 'currentUser';

export function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function removeCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
