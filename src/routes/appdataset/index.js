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

  //Check if dataset is available
  const dataSets = await models.data_sets.findOne({
    where: {
      id: req.body.dataset_id,
    },
  });
  //Check if application is available
	const applications = await models.applications.findOne({
    where: {
      id: req.body.application_id,
    },
  });

  if (dataSets && applications) {
    try{
    	const appDataset = await models.application_datasets.create(req.body)
    	return res.status(201).send({
    	  application_dataset: appDataset.toJSON(),
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
    applicationId,
  } = req.params;
  const user_id = req.user.id;
  try {
    //Get applicationDatasets with dataset
    const applicationDatasets = await models.application_datasets.findAndCountAll({
        where: {
          application_id: applicationId
        },
        include: {
          model: models.data_sets,
          as: 'data_set',
          required: true,
        },
        attributes: ['id','application_id','dataset_id'],
      });
    if (applicationDatasets) {
      res.send({
        result: applicationDatasets.rows,
				count:applicationDatasets.count
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
const unavaibleApplicationDatasets = async (req, res, next) => {
  const {
    applicationId,
  } = req.params;
  const user_id = req.user.id;
  try {
    //Find user's datasets
		const dataSets = await models.data_sets.findAll({
      where: {
        user_id: req.user.id,
      },
    });
    
    //Find connected datasets
    const appDatasets = await models.application_datasets.findAll({
        where: {
          application_id: applicationId
        },
        include: {
          model: models.data_sets,
          as: 'data_set',
          required: true,
        },
      });

    //Return not connected datasets
		const results = dataSets.filter(dataSet=>!appDatasets.some(ds=>ds.dataset_id===dataSet.id))
		
    if (dataSets) {
      res.send({
        //Map and send for vue multiselect
        results: results.map(result => ({ id: result.id, key: result.title })),
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
  const { id } = req.params;
  //Control availability
  const applicationDataset = await models.application_datasets.findOne({
    where: {
      id
    },
  });
  if (applicationDataset) {
    await models.application_datasets.destroy({
      where: {
				id
      },
    });
    res.send({
      message: 'Application Datatset was deleted successfully!',
    });
  }
  return res.status(403).send({
    errors: [
      {
        message: 'Application Dataset not found or you do not have a permission!',
      },
    ],
  });
};

export default {
  prefix: '/application-datasets',
  inject: (router) => {
    router.post('/', create);
    router.get('/:applicationId', list);
		router.get('/unavaible-application-datasets/:applicationId',unavaibleApplicationDatasets)
    router.delete('/:id', deleteById);
  },
};
