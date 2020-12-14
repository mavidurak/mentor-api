'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface. renameColumn("data_sets", "key_title", "data_type");
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface. renameColumn("data_sets", "data_type", "key_title");
  }
};