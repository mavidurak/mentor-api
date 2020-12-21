import { DataTypes } from 'sequelize';

import Sequelize from '../sequelize';

const token = Sequelize.define(
  'token',
  {
    token_value: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expired_at: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
);

const initialize = (models) => {
  models.token.belongsTo(models.user, {
    as: 'user',
    foreignKey: {
      name: 'user_id',
      allowNull: false,
    },
  });
};

export default { model: token, initialize };
