import models from '../models';

import { TOKEN_KEY, SECRET_KEY, WHITE_LIST } from '../constants/api';

export default async (req, res, next) => {
  const is_ignored = WHITE_LIST.findIndex(
    (path) => path === req.fixed_url,
  ) > -1;
  const token = req.get(TOKEN_KEY);

  if (token) {
    const data = await models.token.findOne({
      where: { token_value: token },
      include: [
        {
          model: models.user,
          as: 'user',
        },
      ],
    });

    if (data && data.user.is_email_confirmed) {
      req.user = data.user.toJSON();
    }
  }
  if (is_ignored || req.user) { return next(); }

  if (token) {
    const appdata = await models.applications.findOne({
      where: { access_token: token },
    });
    if (appdata) {
      req.application = appdata.toJSON();

      if (req.application.permission_read === true && req.method === 'GET') {
        console.log(req.data);
        return next();
      }
      if (req.application.permission_write === true && req.method === 'POST') {
        console.log(req.body);
        return next();
      }
      if (req.application.permission_delete === true && req.method === 'DELETE') {
        return next();
      }
    }
  }

  res.send(
    401,
    {
      message: 'You must be login to access here',
    },
  );
};
