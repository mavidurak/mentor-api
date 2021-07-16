'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'applications',
        'user_id',{ 
          type: Sequelize.INTEGER,
          transaction 
        },
      );
      await queryInterface.addConstraint('applications', {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'applications_ibfk_2',
        references: {
          table: 'users',
          field: 'id',
        },
        transaction,
      });
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'applications',
         'applications_ibfk_2',
         {transaction}
      );
      await queryInterface.removeColumn(
        'applications',
        'user_id',
        transaction,
      );
      return transaction.commit();
    }catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};