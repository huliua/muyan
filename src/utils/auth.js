const TokenKey = 'Admin-Token';
const RefreshKey = 'Refresh-Token';

export function getToken() {
  return localStorage.getItem(TokenKey);
}

export function setToken(token) {
  return localStorage.setItem(TokenKey, token);
}

export function removeToken() {
  return localStorage.removeItem(TokenKey);
}

export function setRefreshToekn(token) {
  return localStorage.setItem(RefreshKey, token);
}

export function getRefreshToken() {
  return localStorage.getItem(RefreshKey);
}

export function removeRefreshToken() {
  return localStorage.removeItem(RefreshKey);
}
