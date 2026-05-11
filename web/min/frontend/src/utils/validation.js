export function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export function validatePassword(password) {
  return password.trim().length >= 8;
}

export function validateRequired(value) {
  return value.trim().length > 0;
}

export function validatePasswordMatch(password, repeatPassword) {
  return password === repeatPassword;
}
