export const WHITE_LIST = [
  '/authentications/login/',
  '/authentications/email-confirmation/',
  '/authentications/register/',
  '/api/health-check/',
];
export const APPLICATION_PERMISSION_LIST = {
  get: '/datas/:id',
  post: '/datas/',
  delete: '/datas/:id',
};

export const EMAIL_TEMPLATE_TYPES = {
  CONFIRMATION: 'CONFIRMATION',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
};

export const EMAIL_TOKEN_STATUS = {
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  CONFIRMED: 'confirmed', 
}

export const TOKEN_KEY = 'X-AccessToken';

export const SECRET_KEY = process.env.SECRET_KEY || 'RmtW8YWG2ip5hDtN8EEWKwntdfo522hj';
