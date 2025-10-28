// /lib/authGuard.js
const CONFIG = {
  meUrl: 'http://localhost:8080/auth/me',
  loginUrl: '/pages/login/login.html',
  afterLoginUrl: '/pages/board/board.html', // where to send logged-in users from guest pages
};

async function fetchMe() {
  try {
    const res = await fetch(CONFIG.meUrl, {
      credentials: 'include',
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function ensureAuthPage() {
  const me = await fetchMe();
  if (!me) {
    alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
    location.replace(CONFIG.loginUrl);
    return false;
  }
  return true;
}

async function ensureGuestPage() {
  const me = await fetchMe();
  if (me) {
    location.replace(CONFIG.afterLoginUrl);
    return false;
  }
  return true;
}

// For pages restored from bfcache after logout
function attachBFCacheRecheck() {
  window.addEventListener('pageshow', async (e) => {
    if (!e.persisted) return;
    try {
      const res = await fetch(CONFIG.meUrl, { credentials: 'include' });
      if (res.status === 401) location.replace(CONFIG.loginUrl);
    } catch {
      location.replace(CONFIG.loginUrl);
    }
  });
}

/**
 * Guard the page.
 * mode: 'protected' -> requires session
 *       'guest'     -> must be logged out (e.g., login/signup)
 */
export async function protectPage(mode = 'protected') {
  attachBFCacheRecheck();
  if (mode === 'guest') {
    return await ensureGuestPage();
  }
  return await ensureAuthPage();
}

// Optional: configure URLs (if you later change paths)
export function configureAuth({ meUrl, loginUrl, afterLoginUrl } = {}) {
  if (meUrl) CONFIG.meUrl = meUrl;
  if (loginUrl) CONFIG.loginUrl = loginUrl;
  if (afterLoginUrl) CONFIG.afterLoginUrl = afterLoginUrl;
}

// Utility for other scripts that need current user
export async function currentUser() {
  return await fetchMe();
}