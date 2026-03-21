import { users } from "../mock/users.js";

export function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users.find(
        (item) => item.email === email && item.password === password
      );

      if (!user) {
        reject(new Error("Неверная почта или пароль"));
        return;
      }

      resolve(user);
    }, 300);
  });
}

export function registerUser(newUser) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exists = users.some((item) => item.email === newUser.email);

      if (exists) {
        reject(new Error("Пользователь с такой почтой уже существует"));
        return;
      }

      const createdUser = {
        id: `u${Date.now()}`,
        ...newUser,
      };

      users.push(createdUser);
      resolve(createdUser);
    }, 300);
  });
}