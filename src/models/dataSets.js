import { DataTypes } from 'sequelize';

import Sequelize from '../sequelize';

const data_sets = Sequelize.define(
  'data_sets',
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    underscored: true,
  },
);

const initialize = (models) => {
  models.data_sets.belongsTo(models.user, {
    as: 'user',
    foreignKey: {
      name: 'user_id',
      allowNull: false,
    },
  });
  models.data_sets.hasMany(models.application_datasets,{foreignKey: 'dataset_id'});
};

export default { model: data_sets, initialize };
