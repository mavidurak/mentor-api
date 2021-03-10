module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('email_confirmation_tokens', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'PENDING',
    });
  },
  down: async (queryInterface, Sequelize) => queryInterface.removeColumn('email_confirmation_tokens', 'status'),
};
