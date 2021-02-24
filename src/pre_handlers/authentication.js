import models from '../models';

import {
  TOKEN_KEY, SECRET_KEY, WHITE_LIST, APPLICATION_PERMISSION_LIST,
} from '../constants/api';

const findDiff = (expectedStr, reqStr) => {
  const idRegex = new RegExp('[0-9]*[/]$');
  if (expectedStr && reqStr) {
    let expectedDiff = '';
    expectedStr.split('').forEach((val, i) => {
      if (val !== reqStr.charAt(i)) expectedDiff += val;
    });
    let reqDiff = '';
    reqStr.split('').forEach((val, i) => {
      if (val !== expectedStr.charAt(i)) reqDiff += val;
    });
    if (expectedDiff === ':id' && idRegex.test(reqDiff)) {
      return true;
    }
    if (expectedDiff === '' && reqDiff === '') {
      return true;
    }
  }
  return false;
};

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
    } else {
      const application = await models.applications.findOne({
        where: { access_token: token },
      });
      if (application) {
        const permissions = {
          get: application.permission_read,
          post: application.permission_write,
          delete: application.permission_delete,
        };
        if (permissions[req.method.toLowerCase()]) {
          if (findDiff(APPLICATION_PERMISSION_LIST[req.method.toLowerCase()],
            req.fixed_url.toLowerCase())) {
            req.application = application.toJSON();
          }
        }
      }
    }
  }
  if (is_ignored || req.user || req.application) { return next(); }

  res.send(
    401,
    {
      message: 'You must be login to access here',
    },
  );
};
