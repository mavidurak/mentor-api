import { DataTypes } from 'sequelize';
import models from '.';

import Sequelize from '../sequelize';

import { encrypt } from '../utils/encryption';

const email_confirmation_token = Sequelize.define(
  'email_confirmation_token',
  {
    token_value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
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
    await user.save();
    return true;
  };
};

export default { model: email_confirmation_token, initialize };
