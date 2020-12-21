module.exports = {

  up(queryInterface, Sequelize) {
    return queryInterface.renameColumn('data_sets', 'key_title', 'data_type');
  },
  down(queryInterface, Sequelize) {
    return queryInterface.renameColumn('data_sets', 'data_type', 'key_title');
  },
};
