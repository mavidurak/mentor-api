import Joi from 'joi';
import { Op } from 'sequelize';
import { sendEmail, EmailTypes } from '../../utils/sendEmail';
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
    return res.status(400).send({ error: error.details });
  }

  const { username, password } = req.body;
  const user = await models.user.findOne({
    where: { [Op.or]: { username: username.trim(), email: username.trim() } },
  });

  if (user) {
    const hash = makeSha512(password, user.password_salt);
    if (hash === user.password_hash) {
      if (user.is_email_confirmed !== true) {
        return res.send(403, { message: 'This account has not been confirmed yet.' });
      }

      const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const token = await user.createAccessToken(ip_address);
      return res.status(200).send({ token: token.toJSON() });
    }
  }
  res.send(400, { message: 'User not found!' });
};
const reSendConfirmEmail = async (req, res, next) => {
  const { error, value } = login_validation.body.validate(req.body);
  if (error) {
    return res.status(400).send({ error: error.details });
  }

  const { username, password } = req.body;
  const user = await models.user.findOne({
    where: { [Op.or]: { username: username.trim(), email: username.trim() } }
  });

  if (user) {
    const hash = makeSha512(password, user.password_salt);
    if (hash === user.password_hash) {

      if (user.is_email_confirmed !== true) {
        const emailToken = await user.createEmailConfirmationToken();
        await sendEmail(user, emailToken);
        return res.send(200, { message: 'Confirmation email sent.' })
      }
      return res.send(400, { message: 'User email already confirmed!' });
    }
  }
  res.send(400, { message: 'User not found!' })
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
    return res.send(400, { error });
  }

  const {
    username, password, email, name,
  } = req.body;
  let user = await models.user.findOne({
    where: { [Op.or]: { username: username.trim(), email: email.trim() } },
  });

  if (user) {
    return res.send(400, { error: 'E-mail address or username is used!' });
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

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    user.is_email_confirmed = true;
    user.save();
  } else {
    await sendEmail(user, emailToken);
  }

  res.send(201, { user: user.toJSON(), token: token.toJSON() });
};

const me = (req, res, next) => {
  res.send(200, req.user);
};

const emailConfirm = async (req, res, next) => {
  const token_value = req.query.token;
  const email_confirmation_token = await models.email_confirmation_token.findOne({
    where: {
      token_value,
    },
  });
  if (email_confirmation_token) {
    await email_confirmation_token.confirmEmail();
  }
  return res.redirect(`${process.env.DASHBOARD_UI_PATH}/login`);
};

/// Update Methods///

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
    return res.status(400).send({ message: error.details[0].message });
  }

  const { newUsername, password, newPassword } = req.body;

  if (newUsername) {
    const user = await models.user.findOne({
      where: { id: req.user.id },
    });
    // ----//
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
          message: 'Password Not Correct!',
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
          message: 'Password Not Correct!',
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
    router.post('/resend-emailconfirm',reSendConfirmEmail)
    router.get('/email-confirmation', emailConfirm);
    router.patch('/me', update);
  },
};
