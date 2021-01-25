import { DataTypes } from 'sequelize';
import models from '.';
import models from '../models';

import { token_status } from '../constants/tokenStatus';
import Sequelize from '../sequelize';

import { encrypt } from '../utils/encryption';

const email_confirmation_token = Sequelize.define(
  'email_confirmation_token',
  {
    token_value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

const initialize = (models) => {
  models.email_confirmation_token.belongsTo(models.user, {
    as: 'user',
    foreignKey: {
      name: 'user_id',
      allowNull: false,
    },
  });

  models.email_confirmation_token.prototype.confirmEmail = async function () {
    const user = await models.user.findOne({
      where: {
        id: this.user_id,
      },
    });
    if (!user) {
      return false;
    }

    user.is_email_confirmed = true;
    this.status = token_status.CONFIRMED;
    await user.save();
    await email_confirmation_token.save();
    return true;
  };
};

export default { model: email_confirmation_token, initialize };
