import { DataTypes } from 'sequelize';

import Sequelize from '../sequelize';

const datas = Sequelize.define(
  'datas',
  {
    dataset_id: {
      type: DataTypes.INTEGER,
    },
     value:{
       type: DataTypes.DOUBLE       
     }
  },
  {
    timestamps: true,
    underscored: true
  }
)

const initialize = (models) => {
models.datas.belongsTo(models.data_sets, {
  as: 'data_sets',
  foreignKey: {
    name: 'dataSets_id',
    allowNull: false
  }
});
};

export default { model: datas, initialize };