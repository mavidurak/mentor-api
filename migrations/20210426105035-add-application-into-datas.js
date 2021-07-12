module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'application_data',
      {
        application_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'applications',
            key: 'id',
          },
        },
        data_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'datas',
            key: 'id',
          },
        },      
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
      });
  },
  down: async (queryInterface) => queryInterface.dropTable('application_data'),
};
