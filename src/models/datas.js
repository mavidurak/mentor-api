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
    underscored: true
  }
);

const initialize = (models) => {
  models.datas.belongsTo(models.data_sets, {
    as: 'data_sets',
    foreignKey: {
      name: 'dataset_id',
      allowNull: false
    }
  });
};


export default { model: datas, initialize };

