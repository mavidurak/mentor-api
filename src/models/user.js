import util from 'util';

import { DataTypes } from 'sequelize';

import Sequelize from '../sequelize';

import {
  intToBase36,
  base36ToInt,
  b64Encode,
  encrypt,
  createSaltHashPassword
} from '../utils/encryption';


const user = Sequelize.define(
  'user',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING
    },
    password_salt: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true,
    paranoid: true,
    underscored: true
  }
);

const initialize = (models) => {
  models.user.hasMany(models.token, {
    as: 'user_tokens',
    foreignKey: 'user_id',
    sourceKey: 'id'
  });

  models.user.prototype.toJSON = function () {
    const values = { ...this.get() };

    delete values.password_salt;
    delete values.password_hash;

    return values;
  };

  models.user.prototype.createAccessToken = async function (ip_address) {
    const expired_at = new Date();
    expired_at.setDate(new Date().getDate() + 30);
    const timestamp = Math.round(new Date().getTime() / 1000);
    const key = `${this.id}_${this.password_hash}_${timestamp}`;

    const token = await models.token.create({
      user_id: this.id,
      token_value: encrypt(key),
      expired_at,
      ip_address
    });

    return token;
  };

  models.user.prototype.setPassword = function (password) {
    const { hash, salt } = createSaltHashPassword(password);
    this.password_salt = salt;
    this.password_hash = hash;
  };
};


export default { model: user, initialize };

