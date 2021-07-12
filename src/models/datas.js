import { DataTypes } from 'sequelize';

import Sequelize from '../sequelize';


const datas = Sequelize.define(
  'datas',
  {
    value: {
      type: DataTypes.DOUBLE,
    },
  },
  {
    timestamps: true,
    underscored: true,
  },
);

const initialize = (models) => {
  models.datas.belongsTo(models.data_sets, {
    as: 'data_sets',
    foreignKey: {
      name: 'dataset_id',
      allowNull: false,
    },
  });

  models.datas.belongsToMany(models.applications, {
    as: 'applications',
    through: "application_data",
    foreignKey: {
      name: 'application_id',
      allowNull: true,
    },
  });
};

export default { model: datas, initialize };
