import Joi from 'joi';
import models from '../../models';

const create_validation = {
  body: Joi.object({
    dataset_ids: Joi.array()
      .min(1)
      .required()
      .items(Joi.number()),
    title: Joi.string()
      .min(2)
      .max(40)
      .required(),
    description: Joi.string()
      .min(2)
      .max(30)
      .required(),
    permission_read: Joi.boolean()
      .required(),
    permission_write: Joi.boolean()
      .required(),
    permission_delete: Joi.boolean()
      .required(),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required(),
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required(),
  }),
};

const create = async (req, res, next) => {
  const user_id = req.user.id;
  const {
    error,
    value,
  } = create_validation.body.validate(req.body);
  if (error) {
    return res.send(400, {
      errors: error,
    });
  }

  let requestDto = req.body

  //Find all datasets
  const dataSets = await models.data_sets.findAll({
    where: {
      id: req.body.dataset_ids,
      user_id,
    },
  });
  requestDto.user_id=user_id
  //If all given datasets available
  if (dataSets.length===req.body.dataset_ids.length) {
    //Prepare dataset ids array seqeulize for create process.
    requestDto.application_datasets=req.body.dataset_ids.map(di=>({dataset_id:di}))
    try{
      //Create application with dataset connections
      const application = await models.applications.create(requestDto,{
        include: [{
          model:models.application_datasets
        }]
      })
      
      const { longitude, latitude } = req.body;     
      const location = await models.locations.create({
        application_id: application.id,
        longitude,
        latitude,
      });

      //After create send data for debug. At live it is not required
      return res.status(201).send({
        application: application.toJSON(),
        location,
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
        message: 'Application\'s some data set not found or you do not have a permission!',
      },
    ],
  });
};

const options = async (req,res,next) =>{
  try {
    const applications = await models.applications.findAndCountAll({
      attributes:['id','title'],
    });

    if (applications) {
      res.send({
        results: applications.rows,
        count: applications.count,
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
}

const detailWithDatasetOptions = async (req,res,next) =>{
  try {
    const application = await models.applications.findOne({
      where:{
        id: req.params.id
      },
      include: [{
        model: models.application_datasets,
        as: 'application_datasets',
        attributes:['id'],
        include:{
          model:models.data_sets,
          attributes:[
            'id',
            'title'
          ]
        }
      }],
    });

    if (application) {
      res.send({
        result: application,
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
}

const detail = async (req, res, next) => {
  const {
    id,
  } = req.params;
  const user_id = req.user.id;

  try {
    const application = await models.applications.findOne({
      where: {
        id,
      },
      include: [{
        model: models.data_sets,
        as: 'data_sets',
        where: {
          user_id,
        },
        required: true,
      }, {
        model: models.locations,
        as: 'locations',
        where: {
          application_id: id,
        },
        required: true,
      }],
    });

    if (application) {
      res.send(application);
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

const list = async (req, res, next) => {

  try {
    const applications = await models.applications.findAndCountAll({
     include: [{
        model: models.application_datasets,
        as: 'application_datasets',
        attributes:['id'],
        include:[{
          model:models.data_sets,
          attributes:['id','title','data_type']
        }]
      },
      {
        model:models.locations,
        as:"locations",
        attributes:['longitude','latitude']
      }],
    });

    if (applications) {
      res.send({
        results: applications.rows,
        count: applications.count,
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

const update_validation = {
  body: Joi.object({
    title: Joi.string()
      .min(2)
      .max(40),
    description: Joi.string()
      .min(2)
      .max(30),
    permission_read: Joi.boolean(),
    permission_write: Joi.boolean(),
    permission_delete: Joi.boolean(),
  }),
};

const update = async (req, res, next) => {
  const {
    id,
  } = req.params;

  const {
    error,
    value,
  } = update_validation.body.validate(req.body);
  if (error) {
    return res.send(400, {
      errors: error,
    });
  }

  try {
    const application = await models.applications.findOne({
      where: {
        id,
      },
      include: [{
        model: models.data_sets,
        as: 'data_sets',
        where: {
          user_id,
        },
        required: true,
      }, {
        model: models.locations,
        as: 'locations',
        where: {
          application_id: id,
        },
        required: true,
      }],
    });

    if (application) {
      await models.applications.update(req.body, {
        where: {
          id: application.id,
        },
      });

      const { longitude, latitude } = req.body;
      if (longitude || latitude) {
        await models.locations.update({
          leave_at: Date.now(),
        },{
          where: {
            id: application.locations[application.locations.length - 1].dataValues.id,
          }
        });

        await models.locations.create({
          application_id: application.id,
          longitude,
          latitude,
        });
      }

      return res.status(200).send({
        message: `Id= ${id} was updated succesfully`,
      });
    } else {
      res.status(403).send({
        errors: [
          {
            message: 'Application\'s data set not found or you do not have a permission!',
          },
        ],
      });
    }
  } catch (err) {
    res.status(500).send({
      errors: [
        {
          message: err.message || `Could NOT update application with id= ${id}`,
        },
      ],
    });
  }
};

const deleteById = async (req, res, next) => {
  const {
    id,
  } = req.params;
  
  //Find only applicaition. Because cascade not working correctly due to one is paranoid the other is not
  const application = await models.applications.findOne({
    where: {
      id,
    },
  });

  if (application) {

    //Destroy application dataset connections
    await models.application_datasets.destroy({
      where:{
        application_id:id
      }
    })

    await models.applications.destroy({
      where: {
        id,
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

const applicationIsAlive = async (req, res) => {
  const {id} = req.params;
  const application = await models.applications.findOne({
    where: {
      id, 
    }
  });

  if(!application){
    return res.status(404).send({
      message: "Application not found!",
    });
  }
  return res.status(200).send(`${application.is_alive}`);
};

const setIsAlive = async (req, res) => {
  const {id} = req.params;
  const application = await models.applications.findOne({
    where: {
      id, 
    }
  });

  if(!application){
    return res.status(404).send({
      message: "Application not found!",
    });
  }
  application.is_alive = !application.is_alive;
  application.save();
  return res.status(200).send(`${application.is_alive}`);
};

export default {
  prefix: '/applications',
  inject: (router) => {
    router.post('/', create);
    router.get('/', list);
    router.get('/options', options);
    router.get('/with-dataset-options/:id', detailWithDatasetOptions);
    router.get('/:id', detail);
    router.put('/:id', update);
    router.delete('/:id', deleteById);
    router.get('/:id/health-check', applicationIsAlive);
    router.post('/:id/health-check', setIsAlive);
  },
};
