'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'applications',
         'applications_ibfk_1',
         {transaction}
      );
      await queryInterface.removeColumn(
        'applications',
        'dataset_id',
        transaction,
      );
      return transaction.commit();
    }catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'applications',
        'dataset_id',
        { transaction },
      );
      await queryInterface.addConstraint('datas', {
        fields: ['dataset_id'],
        type: 'foreign key',
        name: 'applications_ibfk_1',
        references: {
          table: 'data_sets',
          field: 'id',
        },
        transaction,
      });
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
