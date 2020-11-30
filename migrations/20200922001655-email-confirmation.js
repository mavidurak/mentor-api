module.exports = {

  up: (queryInterface, Sequelize) => {

    return Promise.all([
      queryInterface.addColumn('users', 'is_email_confirmed', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }),
      queryInterface.removeColumn('users', 'confirmation_token')
    ])
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'is_email_confirmed'
    );
  }
}