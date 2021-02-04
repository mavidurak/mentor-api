import Joi, {
  required,
} from 'joi';
import models from '../../models';

const create_validation = {
  body: Joi.object({
    dataset_id: Joi.number()
      .required(),
    title: Joi.string()
      .min(2)
      .alphanum()
      .max(40)
      .required(),
    description: Joi.string()
      .min(2)
      .max(30)
      .required(),
    access_token: Joi.string()
      .min(5)
      .required(),
    secret_token: Joi.string()
      .min(5)
      .required(),
    permission_read: Joi.boolean()
      .required(),
    permission_write: Joi.boolean()
      .required(),
    permission_delete: Joi.boolean()
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
    const application = await models.applications.create(req.body);
    return res.status(201).send({
      application: application.toJSON(),
    });
  }

  return res.status(400).send({
    err: 'Application not found or you do not have a pormision!',
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
      }],
    });
    if (application) {
      res.send(application);
    } else {
      res.status(204).send({
        message: 'Data set not found !',
      });
    }
  } catch (err) {
    res.status(500).send(
      err || {
        message: `Error retrieving Data set with id= ${id}`,
      },
    );
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
      }],
    });

    if (application) {
      await models.applications.update(req.body, {
        where: {
          id: application.id,
        },
      });
      res.send({
        application,
      });
    } else {
      res.status(204).send({
        message: 'Not found Data set!',
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err || {
      message: `Could NOT update Data set with id= ${id}`,
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
  return res.status(401).send({
    message: 'Not found Data set!',
  });
}; 0;

export default {
  prefix: '/applications',
  inject: (router) => {
    router.post('/', create);
    router.get('/:id', detail);
    router.put('/:id', update);
    router.delete('/:id', deleteById);
  },
};
