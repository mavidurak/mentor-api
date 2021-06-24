'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'application_datasets', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        dataset_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'data_sets',
            key: 'id',
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
        },
        application_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'applications',
            key: 'id',
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
    )
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('application_datasets');
  }
};
