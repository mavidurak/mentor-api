module.exports = {
  
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      application_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'applications',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      longitude: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      latitude: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      leave_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    },
    );
  },
  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('locations');
  },
};
