import Joi from 'joi';
import { Op } from 'sequelize';

import models from '../../models';
import { makeSha512, createSaltHashPassword } from '../../utils/encryption';

const password_validation = {
    newPassword: Joi.string()
      .min(8)
      .max(30)
      .required(),
};
const changePassword = async (req, res, next) => {
  //const { error, value } = register_validation.body.validate(req.body);
/////

const { password,newPassword } = req.body;

const user = await models.user.findOne({
  where: {  id: req.user.id}
});


  const { error, value } = password_validation.newPassword.validate(newPassword);
    if (error) {
      console.log('hata')
      return res.status(400).send( {message: 'New Password must be min 8 max 30 character' });
    }

  //----//
 
  const {
    salt: password_salt,
    hash: password_hash
  } = createSaltHashPassword(newPassword);

  console.log(newPassword)
  console.log(password)
  if (user) {

    const hash = makeSha512(password, user.password_salt);
    
    if (hash === user.password_hash) {
      
      models.user.update({
        password_hash : password_hash,
        password_salt: password_salt},
        {
          where: {
            id: user.id
          }
        }
      )
      res.status(200).send({
        message: `Password updated succesfully`
      });
    }
    else {
      res.status(401).send({
        message: 'Password Not Correct!'
      })
    }
  }
};

const changeUsername = async (req, res, next) => {

const { newUsername,password } = req.body;

const user = await models.user.findOne({
  where: {  id: req.user.id}
});
  //----//
  if (user) {

    const hash = makeSha512(password, user.password_salt);
    console.log(newUsername)
    if (hash === user.password_hash) {
      
      models.user.update({
        username: newUsername},
        {
          where: {
            id: user.id
          }
        }
      )
      res.status(200).send({
        message: `Username updated saccesfully`
      });
    }
    else {
      res.status(401).send({
        message: 'Password Not Correct!'
      })
    }
  }
};

export default {
  prefix: '/user',
  inject: (router) => {
    router.post('/changePassword', changePassword);
    router.post('/changeUsername',changeUsername);
  }
}
