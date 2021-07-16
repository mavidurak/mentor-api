
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
    models.application_datasets.belongsTo(models.applications,{foreignKey: 'application_id'});
    models.application_datasets.belongsTo(models.data_sets,{foreignKey: 'dataset_id'});
  };
  
  export default {
    model: applicationDatasets,
    initialize,
  };