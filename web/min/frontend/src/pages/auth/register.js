import { registerUser } from "../../api/auth.js";
import { validateEmail, validatePassword } from "../../utils/validation.js";

const form = document.getElementById("register-form");
const errorBox = document.getElementById("register-error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const repeatPassword = form.repeatPassword.value.trim();

  errorBox.textContent = "";

  if (!name || !email || !password || !repeatPassword) {
    errorBox.textContent = "Заполните все поля";
    return;
  }

  if (!validateEmail(email)) {
    errorBox.textContent = "Некорректная почта";
    return;
  }

  if (!validatePassword(password)) {
    errorBox.textContent = "Пароль должен быть не короче 8 символов";
    return;
  }

  if (password !== repeatPassword) {
    errorBox.textContent = "Пароли не совпадают";
    return;
  }

  try {
    await registerUser({ name, email, password });
    window.location.href = "/login.html";
  } catch (error) {
    errorBox.textContent = error.message;
  }
});