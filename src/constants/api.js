export const WHITE_LIST = [
  '/authentications/login/',
  '/authentications/email-confirmation/',
  '/authentications/register/',
];
export const APPLICATION_PERMISSION_LIST = [
  { method: 'GET', path: '/datas/:id' },
  { method: 'POST', path: '/datas/' },
  { method: 'DELETE', path: '/datas/:id' },
];

export const TOKEN_KEY = 'X-AccessToken';

export const SECRET_KEY = process.env.SECRET_KEY || 'RmtW8YWG2ip5hDtN8EEWKwntdfo522hj';
