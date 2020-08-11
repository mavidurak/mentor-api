import { DataTypes } from 'sequelize';

import Sequelize from '../sequelize';

const data_sets = Sequelize.define(
    'data_sets',
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
      paranoid: true,
      underscored: true
    }
)

const initialize = (models) => {
  models.data_sets.belongsTo(models.user, {
    as: 'user',
    foreignKey: {
      name: 'user_id',
      allowNull: false
    }
  });
};

export default { model: data_sets, initialize };