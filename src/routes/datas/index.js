import Joi from 'joi';

import models from '../../models';

const create_validation = {
  body: Joi.object({
    dataset_id: Joi
      .number()
      .required(),
    application_id: Joi
      .number()
      .empty(),
    value: Joi.required(),
  }),
};

const add = async (req, res, next) => {
  const { error } = create_validation.body.validate(req.body);

  if (error) {
    return res.send(400, { errors: error.details });
  }

  const { dataset_id, application_id, value } = req.body;
  let data;

  const dataset = await models.data_sets.findOne({
    where: {
      id: dataset_id,
      user_id: req.user.id,
    },
  });

  if (!dataset) {
    return res.status(400).send({
      errors: [
        {
          message: 'Data set not found or you don\'t have permission!',
        },
      ],
    });
  }

  if (application_id) {
    const application = await models.applications.findOne({
      where: {
        id: application_id,
        dataset_id: dataset.id,
      },
    });
    console.log({ application_id, dataset_id: dataset.id, application });
    if (!application) {
      return res.status(400).send({
        errors: [
          {
            message: 'Application not found or you don\'t have permission!',
          },
        ],
      });
    }
  }

  try {
    data = await models.datas.create({
      dataset_id,
      application_id,
      value,
    });
  } catch (err) {
    return res.status(400).send({
      errors: [
        {
          message: err,
        },
      ],
    });
  }

  return res.send(201, { data: data.toJSON() });
};

const getAll = async (req, res, next) => {
  const dataset_id = req.params.id;

  try {
    const data = await models.datas.findAll({
      where: { dataset_id },
    });

    if (data.length === 0) {
      return res.send({ result: [], count: 0 });
    }

    return res.send({ result: data, count: data.length });
  } catch (err) {
    return res.status(500).send({
      errors: [
        {
          message: err.message || 'Some error occurred while retrieving datas.',
        },
      ],
    });
  }
};

const detail = async (req, res, next) => {
  const { id } = req.params;
  try {
    const data = await models.datas.findOne({
      where: { id },
      includes: [
        {
          model: models.data_sets,
          as: 'data',
          required: true,
          where: { userId: req.user.id },
        },
      ],
    });

    if (data) {
      return res.send(data);
    }

    return res.send({
      errors: [
        {
          message: `Error! No such data(id=${id}) or You don't have permission to see the this data`,
        },
      ],
    });
  } catch (err) {
    return res.status(500).send({
      errors: [
        {
          message: err.message || `Error retrieving Data with id=${id}`,
        },
      ],
    });
  }
};

const update = async (req, res, next) => {
  const { id } = req.body;

  try {
    const data = await models.datas.findOne({
      where: { id },
      includes: [
        {
          model: models.data_sets,
          as: 'data',
          required: true,
          where: { userId: req.user.id },
        },
      ],
    });

    if (data === null) {
      return res.send({
        errors: [
          {
            message: `Error find data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`,
          },
        ],
      });
    }

    const num = await models.datas.update(req.body, {
      where: { id },
    });

    if (num === 1) {
      return res.send({ message: `Id= ${id} was updated saccesfully` });
    }

    return res.send({
      errors: [
        {
          message: `Error updating data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`,
        },
      ],
    });
  } catch (err) {
    return res.send({
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

  try {
    const data = await models.datas.findOne({
      where: { id },
      includes: [
        {
          model: models.data_sets,
          as: 'data',
          required: true,
          where: { userId: req.user.id },
        },
      ],
    });

    if (data === null) {
      return res.send({
        errors: [
          {
            message: `Error find data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`,
          },
        ],
      });
    }

    const num = await models.datas.destroy({
      where: { id },
    });

    if (num !== 1) {
      res.send({
        errors: [
          {
            message: `Error deleting data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`,
          },
        ],
      });
    }

    return res.send({
      message: 'Data was deleted successfully!',
    });
  } catch (err) {
    return res.send({
      errors: [
        {
          message: err.message,
        },
      ],
    });
  }
};

export default {
  prefix: '/datas',
  inject: (router) => {
    router.post('/', add);
    router.get('/:id', getAll);
    router.get('/details/:id', detail);
    router.put('/update', update);
    router.delete('/:id', deleteById);
  },
};
