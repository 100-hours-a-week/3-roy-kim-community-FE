// /component/auth/authGuard.js (JWT version based on your previous session-style guard)
(function () {
  const API_BASE = 'http://localhost:8080';
  const LOGIN_URL  = '/pages/login/login.html';
  const HOME_URL   = '/pages/board/board.html';
  const ME_URL     = `${API_BASE}/users/me`;
  const REFRESH_URL= `${API_BASE}/users/refresh`;

  // Core: identical shape to your old session gußard, but with JWT refresh support
  async function checkSession() {
    try {
      // 1) Check current session via /users/me
      let res = await fetch(ME_URL, { credentials: 'include', mode: 'cors' });
      if (res.status === 200) {
        return true; // 접근 인가
      }

      // 2) If 401, try refresh and retry /users/me
      if (res.status === 401) {
        const r = await fetch(REFRESH_URL, { method: 'POST', credentials: 'include', mode: 'cors' });
        if (r.status === 200) {
          res = await fetch(ME_URL, { credentials: 'include', mode: 'cors' });
          if (res.status === 200) {
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Auth check failed:', e);
    }

    // 로그인 안됐을 때
    alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
    location.replace(LOGIN_URL);
    return false;
  }

  // For guest-only pages (login/signup) — if already logged in, send to HOME
  async function ensureGuestPage() {
    try {
      let res = await fetch(ME_URL, { credentials: 'include', mode: 'cors' });
      if (res.status === 200) {
        location.replace(HOME_URL);
        return;
      }
      if (res.status === 401) {
        const r = await fetch(REFRESH_URL, { method: 'POST', credentials: 'include', mode: 'cors' });
        if (r.status === 200) {
          res = await fetch(ME_URL, { credentials: 'include', mode: 'cors' });
          if (res.status === 200) {
            location.replace(HOME_URL);
            return;
          }
        }
      }
    } catch (_) { /* ignore and stay */ }
  }

  // Keep backward compatibility with your current pages
  async function ensureAuthPage() { return checkSession(); }

  // Export for pages that call it explicitly
  window.Auth = { ensureAuthPage, ensureGuestPage, checkSession };
})();