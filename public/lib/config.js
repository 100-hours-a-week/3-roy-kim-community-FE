const BACKEND_BASE_URL = 'http://ec2-3-36-88-131.ap-northeast-2.compute.amazonaws.com:8080';

window.API = {
  BASE_URL: BACKEND_BASE_URL,

  ENDPOINTS: {
    USERS_ME: '/users/me',
    LOGIN: '/users/login',
    LOGOUT: '/users/logout',
    SIGNUP: '/users/signup',
    EMAIL_DUP: '/users/check-email',
    NICK_DUP: '/users/check-nickname',
  },

  url(path) {
    return `${this.BASE_URL}${path}`;
  }
};
