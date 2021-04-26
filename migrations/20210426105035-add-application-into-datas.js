module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('datas', 'application_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'applications',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    });
  },
  down: async (queryInterface) => queryInterface.removeColumn('datas', 'application_id'),
};
