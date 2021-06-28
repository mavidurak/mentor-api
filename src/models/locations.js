import { DataTypes } from 'sequelize';
import Sequelize from '../sequelize';

const locations = Sequelize.define(
  'locations',
  {
    longitude: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    leave_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    }
  },
  {
    timestamps: true,
    underscored: true,
    paranoid: true,
  },
);

const initialize = (models) => {
  models.locations.belongsTo(models.applications, {
    as: 'application',
    foreignKey: {
      name: 'application_id',
      allowNull: false,
    },
  });
};

export default { 
  model: locations,
  initialize
};
