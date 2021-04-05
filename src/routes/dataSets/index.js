import Joi from 'joi';
import models from '../../models';

const create_validation = {
  body: Joi.object({
    title: Joi.string()
      .min(2)
      .max(40)
      .required(),
    data_type: Joi.string()
      .min(2)
      .max(30)
      .required(),
    description: Joi.string()
      .min(2)
      .max(30)
      .required(),
  }),
};

const create = async (req, res, next) => {
  const user_id = req.user.id;
  const { error, value } = create_validation.body.validate(req.body);
  if (error) {
    return res.send(400, { errors: error.details });
  }

  const { title, data_type, description } = req.body;
  let dataSet = await models.data_sets.findOne({
    where: {
      user_id,
      title,
      data_type,
      description,
    },
  });

  dataSet = await models.data_sets.create({
    user_id,
    title,
    data_type,
    description,
  });

  res.send(201, {
    dataSet: dataSet.toJSON(),
  });
};

const list = async (req, res, next) => {
  try {
    const dataSet = await models.data_sets.findAndCountAll({
      where: {
        user_id: req.user.id,
      },
    });

    res.send({
      results: dataSet.rows,
      count: dataSet.count,
    });
  } catch (err) {
    res.status(500).send({
      errors: [
        {
          message: err.message || 'Some error occurred while retrieving data sets.',
        },
      ],
    });
  }
};

const detail = async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const dataSet = await models.data_sets.findOne({
      where: {
        id,
      },
    });
    if (dataSet) {
      if (user_id === dataSet.user_id) {
        res.send(dataSet);
      } else {
        res.status(401).send({
          errors: [
            {
              message: 'You DO NOT have permision to get this Data set!',
            },
          ],
        });
      }
    } else {
      res.status(403).send({
        errors: [
          {
            message: 'Data set not found !',
          },
        ],
      });
    }
  } catch (err) {
    res.status(500).send({
      errors: [
        {
          message: err.message,
        },
      ],
    });
  }
};

const update = async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const dataSet = await models.data_sets.findOne({
      where: {
        id,
      },
    });

    if (dataSet) {
      if (user_id === dataSet.user_id) {
        models.data_sets.update(req.body, {
          where: {
            id: dataSet.id,
          },
        });
        res.send({
          message: `Id= ${id} was updated succesfully`,
        });
      } else {
        res.status(401).send({
          errors: [
            {
              message: 'You DO NOT have permission to update this data set!',
            },
          ],
        });
      }
    } else {
      res.status(403).send({
        errors: [
          {
            message: 'Not found data set!',
          },
        ],
      });
    }
  } catch (err) {
    res.status(500).send({
      errors: [
        {
          message: err.message,
        },
      ],
    });
  }
};

const deleteById = async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const dataSet = await models.data_sets.findOne({
    where: {
      id,
    },
  });

  if (dataSet) {
    if (user_id === dataSet.user_id) {
      models.data_sets.destroy({
        where: {
          id,
        },
      });
      res.send({
        message: 'Data set was deleted successfully!',
      });
    } else {
      res.status(401).send({
        errors: [
          {
            message: 'You DO NOT have permision to delete this Data set!',
          },
        ],
      });
    }

    dataSet.catch((err) => {
      res.status(500).send({
        errors: [
          {
            message: err.message,
          },
        ],
      });
    });
  }
};

export default {
  prefix: '/data-sets',
  inject: (router) => {
    router.get('', list);
    router.post('', create);
    router.get('/:id', detail);
    router.put('/:id', update);
    router.delete('/:id', deleteById);
  },
};
