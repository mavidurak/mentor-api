module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('email_confirmation_tokens', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'pending', 
    }) 
  },
  down : async (queryInterface, Sequelize) => {
   return queryInterface.removeColumn('email_confirmation_tokens', 'status');
  }
}
