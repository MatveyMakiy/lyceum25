import { registerUser } from '../../api/auth.js';
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validatePasswordMatch,
} from '../../utils/validation.js';
import { getCurrentUser } from '../../utils/storage.js';

const form = document.getElementById('register-form');
const errorBox = document.getElementById('register-error');

if (getCurrentUser()) {
  window.location.href = '/feed.html';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const repeatPassword = form.repeatPassword.value.trim();

  errorBox.textContent = '';

  if (
    !validateRequired(name) ||
    !validateRequired(email) ||
    !validateRequired(password) ||
    !validateRequired(repeatPassword)
  ) {
    errorBox.textContent = 'Заполните все поля';
    return;
  }

  if (!validateEmail(email)) {
    errorBox.textContent = 'Введите корректную почту';
    return;
  }

  if (!validatePassword(password)) {
    errorBox.textContent = 'Пароль должен быть не короче 8 символов';
    return;
  }

  if (!validatePasswordMatch(password, repeatPassword)) {
    errorBox.textContent = 'Пароли не совпадают';
    return;
  }

  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ') || '-';

  try {
    await registerUser({
      firstName,
      lastName,
      email,
      password,
    });

    window.location.href = '/login.html';
  } catch (error) {
    errorBox.textContent = error.message;
  }
});