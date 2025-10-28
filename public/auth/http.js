// /lib/http.js
import { configureAuth } from '/auth/authGuard.js';

// If you ever change paths:
configureAuth({ /* meUrl, loginUrl, afterLoginUrl */ });

export async function http(input, init = {}) {
  const res = await fetch(input, { credentials: 'include', ...init });
  if (res.status === 401) {
    // Session expired → sends to login
    alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
    throw new Error('Unauthorized');
  }
  return res;
}