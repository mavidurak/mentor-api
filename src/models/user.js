import { DataTypes, DATE } from 'sequelize';

import Sequelize from '../sequelize';

import {
  intToBase36,
  base36ToInt,
  b64Encode,
  encrypt,
  createSaltHashPassword,
} from '../utils/encryption';

import { EMAIL_TOKEN_STATUS } from '../constants/api';

const user = Sequelize.define(
  'user', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    password_salt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_email_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
    paranoid: true,
    underscored: true,
  },
);

const initialize = (models) => {
  models.user.hasMany(
    models.token, {
      as: 'user_tokens',
      foreignKey: 'user_id',
      sourceKey: 'id',
    },
  );

  models.user.hasMany(
    models.data_sets, {
      as: 'user_data_sets',
      foreignKey: 'user_id',
      sourceKey: 'id',
    },
  );

  models.user.hasMany(
    models.applications, {
      as: 'user_applications',
      foreignKey: 'user_id',
      sourceKey: 'id',
    },
  );

  models.user.hasMany(
    models.email_confirmation_token, {
      as: 'user_email_confirmation_token',
      foreignKey: 'user_id',
      sourceKey: 'id',
    },
  );

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
      ip_address,
    });

    return token;
  };

  models.user.prototype.setPassword = function (password) {
    const { hash, salt } = createSaltHashPassword(password);
    this.password_salt = salt;
    this.password_hash = hash;
  };

  models.user.prototype.createEmailConfirmationToken = async function () {
    const key = this.username + this.email + Math.floor(Math.random() * 9999);
    let key2 = '';

    for (let i = 0; i < key.length; i++) {
      key2 += key[i] + Math.floor(Math.random() * 9);
    }

    const token_value = encrypt(key2);

    const emailConfirmationToken = await models.email_confirmation_token.create({
      token_value,
      user_id: this.id,
    });

    await emailConfirmationToken.cancelOtherTokens();

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      emailConfirmationToken.status = EMAIL_TOKEN_STATUS.CONFIRMED;
      await emailConfirmationToken.save();
    }

    return emailConfirmationToken.token_value;
  };
};

export default { model: user, initialize };
