import { DataTypes, Op } from 'sequelize';

import Sequelize from '../sequelize';
import { EMAIL_TOKEN_STATUS } from '../constants/api';

const email_confirmation_token = Sequelize.define(
  'email_confirmation_token',
  {
    token_value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: EMAIL_TOKEN_STATUS.PENDING,
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
    this.status = EMAIL_TOKEN_STATUS.CONFIRMED;
    this.save();
    this.cancelOtherTokens();
    return true;
  };

  models.email_confirmation_token.prototype.cancelOtherTokens = async function () {
    await models.email_confirmation_token.update({
      status: EMAIL_TOKEN_STATUS.CANCELLED
    },{
      where: {
        user_id: this.user_id,
        id: {
          [Op.ne]: this.id
        }
      },
    });
  };
};

export default { model: email_confirmation_token, initialize };
