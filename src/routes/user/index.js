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
console.log(password + ' ' + newPassword)

const user = await models.user.findOne({
  where: { [Op.or]: { username: req.user.username.trim(), email: req.user.username.trim() } }
});

console.log(user)

  const { error, value } = password_validation.newPassword.validate(newPassword);
    if (error) {
      console.log('hata')
      return res.send(400, { error });
    }

  //----//
    console.log(newPassword)
  const {
    salt: password_salt,
    hash: password_hash
  } = createSaltHashPassword(newPassword);
  console.log('salt : '+password_salt)
  console.log(password_hash)

  console.log(newPassword)
  if (user) {
    console.log(password);
    console.log(user.password_salt);

    const hash = makeSha512(password, user.password_salt);
    console.log(hash)
    console.log(user.password_hash)
    console.log(newPassword)
    
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
        message: `Id=  was updated saccesfully`
      });
    }
    else {
      res.status(401).send({
        message: 'you DO NOT have permission to update this data set!'
      })
    }
  }
};


export default {
  prefix: '/user',
  inject: (router) => {
    router.post('', changePassword);
  }
}
