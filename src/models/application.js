import { DataTypes } from 'sequelize';

import Sequelize from '../sequelize';

const application = Sequelize.define(
    'application',
    {
        title: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING
        },
        access_token: {
            type: DataTypes.STRING
        },
        secret_token: {
            type: DataTypes.STRING
        },
        permission_read: {
            type: DataTypes.BOOLEAN
        },
        permission_delete: {
            type: DataTypes.BOOLEAN
        },
        permission_write: {
            type: DataTypes.BOOLEAN
        }

    },
    {
        timestamps: true,
        underscored: true,
    },
);

const initialize = (models) => {
    models.application.belongsTo(models.data_sets, {
        as: 'data_sets',
        foreignKey: {
            name: 'dataset_id',
            allowNull: false,
        },
    });
};

export default { model: application, initialize };
