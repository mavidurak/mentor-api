import { DataTypes } from 'sequelize';

import Sequelize from '../sequelize';


const email_confirmation_token = Sequelize.define(
  'email_confirmation_token',
  {
    token_value: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    }
  },
  {
    timestamps: true,
    underscored: true
  }
);

const initialize = (models) => {
  models.email_confirmation_token.belongsTo(models.user, {
    as: 'user',
    foreignKey: {
      name: 'user_id',
      allowNull: false
    }
  });
};


export default { model: email_confirmation_token, initialize };

