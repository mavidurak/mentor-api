module.exports = {

  up: (queryInterface, Sequelize) => {

    return Promise.all([
      queryInterface.addColumn('users', 'email_confirmation', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }),
      queryInterface.removeColumn('users', 'confirmation_token')
    ])
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'email_confirmation'
    );
  }
}