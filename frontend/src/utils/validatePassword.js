export function validatePassword(password) {
  if (!password) {
    return 'Password is required.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Your password must contain a lowercase letter.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Your password must contain an uppercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Your password must contain a number.';
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return 'Your password must contain a symbol.';
  }
  if (password.length < 8) {
    return 'Your password must contain at least 8 characters.';
  }
  return '';
}