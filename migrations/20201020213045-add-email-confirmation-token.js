'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable('email_confirmation_tokens'),
        queryInterface.addColumn('users', 'email_confirmation_token', {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null
        })
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable(
          'email_confirmation_tokens',
          {
            id: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
            },
            token_value: {
              type: Sequelize.STRING,
              allowNull: true
            },
            created_at: {
              allowNull: false,
              type: Sequelize.DATE
            },
            updated_at: {
              allowNull: false,
              type: Sequelize.DATE
            },
            deleted_at: {
              type: Sequelize.DATE
            },
            user_id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: {
                model: 'users',
                key: 'id'
              }
            }
          }
        ),
        queryInterface.removeColumn('users', 'email_confirmation_token')
      ]);
    });
  }
};
