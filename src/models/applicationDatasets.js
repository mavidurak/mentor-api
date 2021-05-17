
  import Sequelize from '../sequelize';
  
  const applicationDatasets = Sequelize.define(
    'application_datasets', {},
    {
      timestamps: true,
      paranoid: true,
      underscored: true,
    },
  );
  
  const initialize = (models) => {
    models.applications.belongsToMany(models.data_sets, {
      through:'application_datasets',
      foreignKey:'application_id',
      otherKey:'dataset_id',
      as:'Datasets'
    });
    models.data_sets.belongsToMany(models.applications, {
      through:'application_datasets',
      foreignKey:'dataset_id',
      otherKey:'application_id',
      as:'Applications'
      });
  };
  
  export default {
    model: applicationDatasets,
    initialize,
  };