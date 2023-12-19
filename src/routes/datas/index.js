import Joi from 'joi';
import { Op } from 'sequelize';

import models from '../../models';

const create_validation = {
  body: Joi.object({
    dataset_id: Joi.required(),
    value: Joi.required(),
  }),
};

const add = async (req, res, next) => {
  const { error } = create_validation.body.validate(req.body);

  if (error) {
    return res.send(400, { errors: error.details });
  }

  const { dataset_id, value } = req.body;
  let data;

  try {
    data = await models.datas.create({
      dataset_id,
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

  res.send(201, { data: data.toJSON() });
};

const getAll = async (req, res, next) => {
  const dataset_id = req.params.id;

  try {
    const data = await models.datas.findAll({
      where: { dataset_id },
    });

    if (data.length == 0) {
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

    if (num == 1) {
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

    if (num == 1) {
      res.send({
        message: 'Data was deleted successfully!',
      });
    } else {
      res.send({
        errors: [
          {
            message: `Error deleye data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`,
          },
        ],
      });
    }
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

const getDataByDate = async (req, res, next) => {
  const { id ,startDate,endDate} = req.params;
  try {
    const data = await models.datas.findAll({
      where: {
        dataset_id:id,
        created_at: { [Op.and]: [{ [Op.gte]: startDate }, { [Op.lte]: endDate }] }
      },
    });
    if(data.length > 0){
      res.send({
        data,
      });
    }else {
      res.send({
        errors: [
          {
            message: 'Data not found in this time interval',
          },
        ],
      });
    }
    
  } catch (error) {
    return res.send({
      errors: [
        {
          message: err.message,
        },
      ],
    });
  }
}

const getDataByLocation = async (req,res,next) => {
  const {applicationId,datasetId,longitude, latitude} = req.params;
  const application = await models.locations.findOne({

    where: {
      application_id:applicationId,
      longitude: { [Op.lte]: longitude },
      latitude:{ [Op.lte]: latitude },
    },
  });
  if(!application){
    res.send({
      errors: [
        {
          message: 'Application not found in this location',
        },
      ],
    });
  }

  const data = await models.datas.findAll({
    where: {
      dataset_id:datasetId,
    },
  });

  if(!data){
    res.send({
      errors: [
        {
          message: 'Data not found in this location',
        },
      ],
    });
  }
  res.send({
    data,
  });
}

export default {
  prefix: '/datas',
  inject: (router) => {
    router.get('/:id', getAll);
    router.get('/details/:id', detail);
    router.post('/', add);
    router.put('/update', update);
    router.delete('/:id', deleteById);
    router.get('/data-sets/:id/:startDate/:endDate',getDataByDate);
    router.get('/application/:applicationId/data-sets/:datasetId/:longitude/:latitude',getDataByLocation);

  },
};
