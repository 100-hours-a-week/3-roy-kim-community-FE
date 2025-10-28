// /lib/boot-auth.js
import { protectPage } from '/auth/authGuard.js';

// Optional: hide content until auth check completes
const root = document.documentElement;
root.classList.add('auth-pending');

const mode = root.dataset.auth; // 'protected' | 'guest' | undefined
(async () => {
  if (mode === 'protected') {
    const ok = await protectPage('protected');
    if (ok) root.classList.remove('auth-pending');
  } else if (mode === 'guest') {
    const ok = await protectPage('guest');
    if (ok) root.classList.remove('auth-pending');
  } else {
    // Page not participating in auth protection
    root.classList.remove('auth-pending');
  }
})();