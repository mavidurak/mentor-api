import Joi from 'joi';
import models from '../../models';

const create_validation = {
  body: Joi.object({
    dataset_id: Joi.number()
      .required(),
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

  const dataSet = await models.data_sets.findOne({
    where: {
      id: req.body.dataset_id,
      user_id,
    },
  });

  if (dataSet) {
    const { longitude, latitude } = req.body;
    const application = await models.applications.create(req.body);
    const location = await models.locations.create({
      application_id: application.id,
      longitude,
      latitude,
    });
    return res.status(201).send({
      application: application.toJSON(),
      location,
    });
  }

  return res.status(403).send({
    errors: [
      {
        message: 'Application\'s data set not found or you do not have a permission!',
      },
    ],
  });
};

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

const update = async (req, res, next) => {
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
      res.send({
        application: application.toJSON(),
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
  const user_id = req.user.id;
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
    }],
  });

  if (application) {
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

export default {
  prefix: '/applications',
  inject: (router) => {
    router.post('/', create);
    router.get('/:id', detail);
    router.put('/:id', update);
    router.delete('/:id', deleteById);
  },
};
