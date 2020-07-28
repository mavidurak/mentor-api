import Joi from 'joi';
import { Op } from 'sequelize';

import models from '../../models';

const create_validation = {
  body: Joi.object({
    title: Joi.string()
      .alphanum()
      .max(40)
      .required(),
    key_title: Joi.string()
      .max(30)
      .required(),
    description: Joi.string()
      .max(30)
      .required(),
  })
};

const create = async (req, res, next) => {
  const user_id = req.user.id;
  const { error, value } = create_validation.body.validate(req.body);
  if (error) {
    return res.send(400, { error });
  }

  const { title, key_title, description } = req.body;
  let dataSet = await models.dataSets.findOne({
    where: { [Op.and]: { user_id: user_id, title: title, key_title: key_title, description: description } }
  });
  if(dataSet) {
    return res.send({err: "The Data Set already exists"})
  }
  dataSet = await models.dataSets.create({
    user_id,
    title,
    key_title,
    description
  });

  res.send(201, { dataSet: dataSet.toJSON()});
}

const list = async (req, res, next) => {
  const user_id = req.user.id;
  models.dataSets.findAll({
    where: {user_id: user_id}
  }).then(data => {
    res.send(data)
  }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving data sets."
      });
	});
    
}

const detail = async (req, res, next) => {
  const id = req.params.id;
  const user_id = req.user.id;
	models.dataSets.findOne({where: {
    user_id: user_id,
    id: id
  }})
	  .then(data => {
		    if(data)
				res.send(data);
      else
        res.send({err: `Error! No such dataSet(id=${id}) or You don't have permission to see the this data set`});
	  })
	  .catch(err => {
		res.status(500).send(err || {
		  message: "Error retrieving Data set with id=" + id
		});
	  });
}

const update = async (req, res, next) => {
  const id = req.params.id;
  const user_id = req.user.id;
  models.dataSets.update(req.body, {where: {
    user_id: user_id,
    id: id
  }}
    ).then(num => {
      if(num == 1)
        res.send({message: `Id= ${id} was updated saccesfully`});
      else
      res.send({
        err: `Error updating data set with id=${id}.No such dataSet(id=${id}) or You don't have permission to see the this data set`
      })
    }).catch(err => {
      res.status(500).send(err || {
        message: "Could not update Data set with id=" + id
      })
    })
}

const deleteById = async (req, res, next) => {
  const id = req.params.id;
  const user_id = req.user.id;
	models.dataSets.destroy({where: {
    user_id: user_id,
    id: id
  }})
	  .then(num => {
		if (num == 1) {
		  res.send({
			message: `Data set was deleted successfully!`
		  });
		} else {
		  res.send({
			message: `Cannot delete Data set with id=${id}.No such dataSet(id=${id}) or You don't have permission to see the this data set`
		  });
		}
	  })
	  .catch(err => {
		res.status(500).send(err || {
		  message: "Could not delete Data set with id=" + id
		});
	  });
}

export default {
  prefix: '/data-sets',
  inject: (router) => {
    router.get('/list', list);
    router.get('/detail/:id', detail);
    router.post('/create', create);
    router.put('/update/:id', update);
    router.delete('/delete/:id', deleteById);
  }
}