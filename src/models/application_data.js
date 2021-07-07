import { DataTypes } from 'sequelize';

import Sequelize from '../sequelize';

const application_data = Sequelize.define(
  'application_data',
  {},
  {
    timestamps: true,
    underscored: true,
  },
);

const initialize = (models) => {
};

export default { model: application_data, initialize };
