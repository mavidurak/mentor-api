import Joi from 'joi';
import { Op } from 'sequelize';
import { sendEmail } from '../../utils/sendEmail'
import models from '../../models';
import { makeSha512, createSaltHashPassword, encrypt, b64Encode, b64Decode } from '../../utils/encryption';


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
      .required()
  })
};
const login = async (req, res, next) => {
  const { error, value } = login_validation.body.validate(req.body);
  if (error) {
    return res.status(400).send({ error :error.details});
  }

  const { username, password } = req.body;
  const user = await models.user.findOne({
    where: { [Op.or]: { username: username.trim(), email: username.trim() } }
  });

  if (user) {
    const hash = makeSha512(password, user.password_salt);
    if (hash === user.password_hash) {
      const emailConfirm = await models.email_confirmation_token.findOne({
        where: {
          user_id: user.id
        }
      })
      if (emailConfirm.token_value != null) {
        return res.send(403, { message: 'This account has not been confirmed yet.' })
      }
      const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const token = await user.createAccessToken(ip_address);
      return res.status(200).send({ token: token.toJSON() });
    }
  }
  res.send(400,{ message: 'User not found!' })
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
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'edu'] } }),
    name: Joi.string().min(3).max(30).required()
  })
};
const register = async (req, res, next) => {
  const { error, value } = register_validation.body.validate(req.body);
  if (error) {
    return res.send(400, { error });
  }

  const { username, password, email, name } = req.body;
  let user = await models.user.findOne({
    where: { [Op.or]: { username: username.trim(), email: email.trim() } }
  });

  if (user) {
    return res.send(400, { error: 'E-mail address or username is used!' });
  }

  const {
    salt: password_salt,
    hash: password_hash
  } = createSaltHashPassword(password);
  const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  user = await models.user.create({
    username,
    email,
    name,
    password_salt,
    password_hash
  })

  const token = await user.createAccessToken(ip_address);

  const confirmation_token = await user.createConfirmationToken();

  res.send(201, { user: user.toJSON(), token: token.toJSON(), confirmationToken: confirmation_token.toJSON() });

  await sendEmail(user, confirmation_token.token_value);
};
const me = (req, res, next) => {
  res.send(200, req.user);
}

const confirmEmail = async (req, res, next) => {
  const token_value = req.query.token;
  const user = await models.email_confirmation_token.findOne({
    where: {
      token_value
    }
  });
  if (user) {
    user.token_value = null;
    await user.save()
  }
  return res.redirect(`${process.env.FRONTEND_PATH}/login`);

}

export default {
  prefix: '/authentications',
  inject: (router) => {
    router.get('/me', me);
    router.post('/register', register);
    router.post('/login', login);
    router.get('/email-confirmation', confirmEmail);
  }
};
