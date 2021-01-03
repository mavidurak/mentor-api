'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'datas',
        'datas_ibfk_1',
        { transaction }
      );
      await queryInterface.addConstraint('datas',  {
        fields: ['dataset_id'],
        type: 'foreign key',
        name: 'datas_ibfk_1',
        references: {
          table: 'data_sets',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction
      });
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'datas',
        'datas_ibfk_1',
        { transaction }
      );
      await queryInterface.addConstraint('datas', {
        fields: ['dataset_id'],
        type: 'foreign key',
        name: 'datas_ibfk_1',
        references: {
          table: 'data_sets',
          field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction
      });
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  
};
