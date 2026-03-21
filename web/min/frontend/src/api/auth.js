import { users as defaultUsers } from '../mock/users.js';

const USERS_KEY = 'mockUsers';

function getStoredUsers() {
  const raw = localStorage.getItem(USERS_KEY);

  if (raw) {
    return JSON.parse(raw);
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return [...defaultUsers];
}

function saveStoredUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getStoredUsers();

      const user = users.find(
        (item) => item.email === email && item.password === password,
      );

      if (!user) {
        reject(new Error('Неверная почта или пароль'));
        return;
      }

      resolve(user);
    }, 300);
  });
}

export function registerUser(newUser) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getStoredUsers();

      const exists = users.some((item) => item.email === newUser.email);

      if (exists) {
        reject(new Error('Пользователь с такой почтой уже существует'));
        return;
      }

      const createdUser = {
        id: `u${Date.now()}`,
        ...newUser,
      };

      users.push(createdUser);
      saveStoredUsers(users);

      resolve(createdUser);
    }, 300);
  });
}
