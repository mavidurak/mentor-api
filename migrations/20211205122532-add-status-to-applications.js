module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('applications', 'is_alive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },
  down: async (queryInterface, Sequelize) => queryInterface.removeColumn('applications', 'is_alive'),
};