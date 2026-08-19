const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export function saveAuth(accessToken, user) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);

  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}