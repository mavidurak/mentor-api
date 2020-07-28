import { DataTypes } from 'sequelize';

import Sequelize from '../sequelize';

const dataSets = Sequelize.define(
    'dataSets',
    {
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          title: {
            type: DataTypes.STRING,
            allowNull: false
          },
          key_title: {
            type: DataTypes.STRING,
            allowNull: false
          },
          description: {
            type: DataTypes.STRING,
            allowNull: true
          }
    },
    {
      timestamps: true,
      underscored: false
    }
)

const initialize = (models) => {
  models.dataSets.belongsTo(models.user, {
    as: 'user',
    foreignKey: {
      name: 'user_id',
      allowNull: false
    }
  });
};

export default { model: dataSets, initialize };