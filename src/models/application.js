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
      defaultValue: null,
    },
    secret_token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
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

const initialize = (models) => {
  models.applications.belongsTo(models.data_sets, {
    as: 'data_sets',
    foreignKey: {
      name: 'dataset_id',
      allowNull: false,
    },
  });

  models.applications.prototype.createToken = async function () {
    const expired_at = new Date();
    expired_at.setDate(new Date().getDate() + 30);
    const timestamp = Math.round(new Date().getTime() / 1000);
    const random = Math.floor(Math.random() * 999999);
    const key = `${this.id}_${random}_${timestamp}`;

    this.access_token = encrypt(key);
    this.secret_token = encrypt(this.access_token);

    await this.save();
  };
};

export default {
  model: applications,
  initialize,
};
