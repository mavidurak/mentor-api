import {
  DataTypes,
} from 'sequelize';

import Sequelize from '../sequelize';
import {
  encrypt,
} from '../utils/encryption';

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
      allowNull: true,
      defaultValue: createToken(),
    },
    secret_token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: createToken(),
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
  },
  {
    timestamps: true,
    paranoid: true,
    underscored: true,
  },
);

function createToken() {
  const expired_at = new Date();
  expired_at.setDate(new Date().getDate() + 30);
  const timestamp = Math.round(new Date().getTime() / 1000);

  const rand = () => Math.random(0).toString(36).substr(2);
  const token = (length) => (rand() + rand() + rand() + rand()).substr(0, length);
  const key = `${token(15)}_${timestamp}`;

  return encrypt(key);
}

const initialize = (models) => {

  models.applications.belongsTo(models.data_sets, {
    as: 'data_sets',
    foreignKey: {
      name: 'dataset_id',
      allowNull: false,
    },
  });

  models.applications.hasMany(
    models.locations, {
      as: 'locations',
      foreignKey: 'application_id',
      sourceKey: 'id',
    },
  );

  models.applications.hasMany(models.application_datasets, {
    foreignKey: 'application_id'
  });

};

export default {
  model: applications,
  initialize,
};
