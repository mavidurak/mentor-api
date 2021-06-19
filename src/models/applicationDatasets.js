
  import Sequelize from '../sequelize';
  
  const applicationDatasets = Sequelize.define(
    'application_datasets', {},
    {
      timestamps: true,
      paranoid: false,
      underscored: true,
    },
  );
  
  const initialize = (models) => {
    models.applications.belongsToMany(models.data_sets, {
      through:'application_datasets',
      foreignKey:'application_id',
      otherKey:'dataset_id',
      as:'data_sets'
    });
    models.data_sets.belongsToMany(models.applications, {
      through:'application_datasets',
      foreignKey:'dataset_id',
      otherKey:'application_id',
      as:'applications'
      });
    models.applications.hasMany(models.application_datasets,{foreignKey: 'application_id'});
    models.application_datasets.belongsTo(models.applications,{foreignKey: 'application_id'});
    models.data_sets.hasMany(models.application_datasets,{foreignKey: 'dataset_id'});
    models.application_datasets.belongsTo(models.data_sets,{foreignKey: 'dataset_id'});
  };
  
  export default {
    model: applicationDatasets,
    initialize,
  };