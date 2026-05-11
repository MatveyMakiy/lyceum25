import { loginUser } from '../../api/auth.js';
import { saveCurrentUser, getCurrentUser } from '../../utils/storage.js';
import { validateEmail, validateRequired } from '../../utils/validation.js';

const form = document.getElementById('login-form');
const errorBox = document.getElementById('login-error');

if (getCurrentUser()) {
  window.location.href = '/feed.html';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value.trim();

  errorBox.textContent = '';

  if (!validateRequired(email) || !validateRequired(password)) {
    errorBox.textContent = 'Заполните все поля';
    return;
  }

  if (!validateEmail(email)) {
    errorBox.textContent = 'Введите корректную почту';
    return;
  }

  try {
    const user = await loginUser(email, password);
    saveCurrentUser(user);
    window.location.href = '/feed.html';
  } catch (error) {
    errorBox.textContent = error.message;
  }
});
