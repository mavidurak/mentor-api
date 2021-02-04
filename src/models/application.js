import {
  DataTypes,
} from 'sequelize';

import Sequelize from '../sequelize';

const applications = Sequelize.define(
  'applications', {
    title: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    access_token: {
      type: DataTypes.STRING,
    },
    secret_token: {
      type: DataTypes.STRING,
    },
    permission_read: {
      type: DataTypes.BOOLEAN,
    },
    permission_delete: {
      type: DataTypes.BOOLEAN,
    },
    permission_write: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

const initialize = (models) => {
  models.applications.belongsTo(models.data_sets, {
    as: 'data_sets',
    foreignKey: {
      name: 'dataset_id',
      allowNull: false,
    },
  });
};

export default {
  model: applications,
  initialize,
};
