const LOGIN_URL = '/pages/login/login.html';
const ME_URL = 'http://localhost:8080/users/me';

async function checkSession() {
  try {
    const res = await fetch(ME_URL, {
      credentials: 'include'
    });

    if (res.status === 200) {
      return true; // 접근 인가 
    }
  } catch (e) {
    console.error('Session check failed:', e);
  }

  // 로그인 안됐을 때
  alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
  location.replace(LOGIN_URL);
  return false;
}


checkSession();