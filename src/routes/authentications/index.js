import { Op } from 'sequelize';
import Joi from '../../joi';
import { sendEmail } from '../../utils/sendEmail';
import { EMAIL_TEMPLATE_TYPES, EMAIL_TOKEN_STATUS } from '../../constants/api';
import models from '../../models';
import {
  makeSha512, createSaltHashPassword, encrypt, b64Encode, b64Decode,
} from '../../utils/encryption';

const login_validation = {
  body: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required(),
    password: Joi.string()
      .min(8)
      .max(30)
      .required(),
  }),
};
const login = async (req, res, next) => {
  const { error, value } = login_validation.body.validate(req.body);
  if (error) {
    return res.status(400).send({ errors: error.details });
  }

  const { username, password } = req.body;
  const user = await models.user.findOne({
    where: { [Op.or]: { username: username.trim(), email: username.trim() } },
  });

  if (user) {
    const hash = makeSha512(password, user.password_salt);
    if (hash === user.password_hash) {
      if (user.is_email_confirmed !== true) {
        return res.send(403, {
          errors: [
            {
              message: 'This account has not been confirmed yet.',
            },
          ],
        });
      }

      const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const token = await user.createAccessToken(ip_address);
      return res.status(200).send({ token: token.toJSON() });
    }
  }
  res.send(400, {
    errors: [
      {
        message: 'User not found!',
      },
    ],
  });
};
const reSendConfirmEmail = async (req, res, next) => {
  const { error, value } = login_validation.body.validate(req.body);
  if (error) {
    return res.status(400).send({
      errors: error.details,
    });
  }

  const { username, password } = req.body;
  const user = await models.user.findOne({
    where: {
      [Op.or]: {
        username: username.trim(),
        email: username.trim(),
      },
    },
  });

  if (user) {
    const hash = makeSha512(password, user.password_salt);
    if (hash === user.password_hash) {
      const emailToken = await user.createEmailConfirmationToken();
      user.is_email_confirmed = false;
      await user.save();
      await sendEmail(EMAIL_TEMPLATE_TYPES.CONFIRMATION, user, emailToken);
      return res.send(200, { message: 'Confirmation email sent.' });
    }
  }

  res.send(400, {
    errors: [
      {
        message: 'User not found!',
      },
    ],
  });
};
const register_validation = {
  body: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required(),
    password: Joi.string()
      .min(8)
      .max(30)
      .required(),
    email: Joi.string()
      .email({ minDomainSegments: 2 }),
    name: Joi.string().min(3).max(30).required(),
  }),
};
const register = async (req, res, next) => {
  const { error, value } = register_validation.body.validate(req.body);
  if (error) {
    return res.send(400, { errors: error.details });
  }

  const {
    username, password, email, name,
  } = req.body;
  let user = await models.user.findOne({
    where: { [Op.or]: { username: username.trim(), email: email.trim() } },
  });

  if (user) {
    return res.send(400, {
      errors: [
        {
          message: 'E-mail address or username is used!',
        },
      ],
    });
  }

  const {
    salt: password_salt,
    hash: password_hash,
  } = createSaltHashPassword(password);
  const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  user = await models.user.create({
    username,
    email,
    name,
    password_salt,
    password_hash,
  });

  const token = await user.createAccessToken(ip_address);

  const emailToken = await user.createEmailConfirmationToken();

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    user.is_email_confirmed = true;
    user.save();
  } else {
    await sendEmail(EMAIL_TEMPLATE_TYPES.CONFIRMATION, user, emailToken);
  }

  res.send(201);
};

const me = (req, res, next) => {
  res.send(200, req.user);
};

const emailConfirm = async (req, res, next) => {
  const token_value = req.query.token;
  const email_confirmation_token = await models.email_confirmation_token.findOne({
    where: {
      token_value,
      status: EMAIL_TOKEN_STATUS.PENDING,
    },
  });
  if (email_confirmation_token) {
    await email_confirmation_token.confirmEmail();
  }
  return res.redirect(`${process.env.DASHBOARD_UI_PATH}/login`);
};

const update_validation = {
  body: Joi.object({
    newPassword: Joi.string()
      .min(8)
      .max(30),
    newUsername: Joi.string()
      .alphanum()
      .min(3)
      .max(30),
    password: Joi.string()
      .min(3)
      .max(30),
  }),
};

const update = async (req, res, next) => {
  const { error, value } = update_validation.body.validate(req.body);
  if (error) {
    return res.status(400).send({ errors: error.details });
  }

  const { newUsername, password, newPassword } = req.body;

  if (newUsername) {
    const user = await models.user.findOne({
      where: { id: req.user.id },
    });

    if (user) {
      const hash = makeSha512(password, user.password_salt);
      if (hash === user.password_hash) {
        await models.user.update({
          username: newUsername,
        },
        {
          where: {
            id: user.id,
          },
        });
        res.status(200).send({
          message: 'Username updated saccesfully',
        });
      } else {
        res.status(401).send({
          errors: [
            {
              message: 'Password Not Correct!',
            },
          ],
        });
      }
    }
  }
  if (newPassword) {
    const user = await models.user.findOne({
      where: { id: req.user.id },
    });

    const {
      salt: password_salt,
      hash: password_hash,
    } = createSaltHashPassword(newPassword);

    if (user) {
      const hash = makeSha512(password, user.password_salt);

      if (hash === user.password_hash) {
        await models.user.update({
          password_hash,
          password_salt,
        },
        {
          where: {
            id: user.id,
          },
        });
        res.status(200).send({
          message: 'Password updated succesfully',
        });
      } else {
        res.status(401).send({
          errors: [
            {
              message: 'Password Not Correct!',
            },
          ],
        });
      }
    }
  }
};

export default {
  prefix: '/authentications',
  inject: (router) => {
    router.get('/me', me);
    router.post('/register', register);
    router.post('/login', login);
    router.post('/resend-confirm-email', reSendConfirmEmail);
    router.get('/email-confirmation', emailConfirm);
    router.patch('/me', update);
  },
};
