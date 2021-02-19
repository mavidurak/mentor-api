export const WHITE_LIST = [
  '/authentications/login/',
  '/authentications/email-confirmation/',
  '/authentications/register/',
];
export const APPLICATION_PERMISSION_LIST = {
  GET: '/datas/:id',
  POST: '/datas/',
  DELETE: '/datas/:id',
};

export const TOKEN_KEY = 'X-AccessToken';

export const SECRET_KEY = process.env.SECRET_KEY || 'RmtW8YWG2ip5hDtN8EEWKwntdfo522hj';
