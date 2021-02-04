module.exports = {

  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'applications', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        dataset_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'data_sets',
            key: 'id',
          },
          onUpdate: 'cascade',
          onDelete: 'cascade',
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        access_token: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        secret_token: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        permission_read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        permission_write: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        permission_delete: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
      },
    );
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('applications');
  },

};
