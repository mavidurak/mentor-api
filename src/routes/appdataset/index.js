import Joi from 'joi';
import models from '../../models';

const create_validation = {
  body: Joi.object({
    application_id: Joi.number()
			.positive()
      .required(),
    dataset_id: Joi.number()
			.positive()
      .required(),
  }),
};

//Create
const create = async (req, res, next) => {
  const {
    error,
    value,
  } = create_validation.body.validate(req.body);
  if (error) {
    return res.send(400, {
      errors: error,
    });
  }

  const dataSets = await models.data_sets.findOne({
    where: {
      id: req.body.dataset_id,
    },
  });

	const applications = await models.applications.findOne({
    where: {
      id: req.body.application_id,
    },
  });

  if (dataSets&&applications) {
    try{
    	const appDataset = await models.application_datasets.create(req.body)
    	return res.status(201).send({
    	  applicationDataset: appDataset.toJSON(),
    	});
    }catch (err) {
      res.status(500).send({
        errors: [
          {
            message: err.message || `Error retrieving application with id= ${id}`,
          },
        ],
      });
    }
  }

  return res.status(403).send({
    errors: [
      {
        message: 'Application or dataset not found or you do not have a permission!',
      },
    ],
  });
};

const list = async (req, res, next) => {
  const {
    id,
  } = req.params;
  const user_id = req.user.id;
  try {
    const dataSets = await models.application_datasets.findAndCountAll({
        where: {
          application_id: id
        },
				include: {
					model: models.data_sets,
					as: 'data_set',
					where: {
						user_id,
					},
					required: true,
				},
      });
    if (dataSets) {
      res.send({
        result: dataSets.rows,
				count:dataSets.count
      });
    } else {
      res.status(403).send({
        errors: [
          {
            message: 'Application not found or you do not have a permission!',
          },
        ],
      });
    }
  } catch (err) {
    res.status(500).send({
      errors: [
        {
          message: err.message || `Error retrieving application with id= ${id}`,
        },
      ],
    });
  }
};
const addablesforapp = async (req, res, next) => {
  const {
    id,
  } = req.params;
  const user_id = req.user.id;
  try {
		const dataSets = await models.data_sets.findAll({
      where: {
        user_id: req.user.id,
      },
    });
    const appDatasets = await models.application_datasets.findAll({
        where: {
          application_id: id
        },
				include: {
					model: models.data_sets,
					as: 'data_set',
					where: {
						user_id,
					},
					required: true,
				},
      });
		const results = dataSets.filter(dataSet=>!appDatasets.some(ds=>ds.dataset_id===dataSet.id))
		
    if (dataSets) {
      res.send({
        results: Object.values(results).map(result => ({ id: result.id, key: result.title })),
      });
    } else {
      res.status(403).send({
        errors: [
          {
            message: 'Application not found or you do not have a permission!',
          },
        ],
      });
    }
  } catch (err) {
    res.status(500).send({
      errors: [
        {
          message: err.message || `Error retrieving application with id= ${id}`,
        },
      ],
    });
  }
};

const deleteById = async (req, res, next) => {
  const {
    appId,
		datasetId
  } = req.params;
  const user_id = req.user.id;
  const appDataset = await models.application_datasets.findOne({
    where: {
      application_id:appId,
			dataset_id:datasetId
    },
  });
  if (appDataset) {
    await models.application_datasets.destroy({
      where: {
				application_id:appId,
				dataset_id:datasetId
      },
    });
    res.send({
      message: 'Application was deleted successfully!',
    });
  }
  return res.status(403).send({
    errors: [
      {
        message: 'Application not found or you do not have a permission!',
      },
    ],
  });
};

export default {
  prefix: '/appdatasets',
  inject: (router) => {
    router.post('/', create);
    router.get('/app/:id', list);
		router.get('/addablesforapp/:id',addablesforapp)
    router.delete('/:appId/:datasetId', deleteById);
  },
};
