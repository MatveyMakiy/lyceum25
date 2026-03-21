import { loginUser } from "../../api/auth.js";
import { saveCurrentUser } from "../../utils/storage.js";

const form = document.getElementById("login-form");
const errorBox = document.getElementById("login-error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value.trim();

  errorBox.textContent = "";

  if (!email || !password) {
    errorBox.textContent = "Заполните все поля";
    return;
  }

  try {
    const user = await loginUser(email, password);
    saveCurrentUser(user);
    window.location.href = "/feed.html";
  } catch (error) {
    errorBox.textContent = error.message;
  }
});