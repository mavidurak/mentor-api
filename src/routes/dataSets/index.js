import Joi from 'joi';
import { Op } from 'sequelize';

import models from '../../models';

const create_validation = {
  body: Joi.object({//TODO: user_id ekle
    user_id: Joi.number()
      .min(1)
      .exist(),
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
  const { error, value } = create_validation.body.validate(req.body);
  if (error) {
    return res.send(400, { error });
  }

  const { user_id, title, key_title, description } = req.body;
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

const getAll = async (req, res, next) => {
  models.dataSets.findAll({
    where: {}
  }).then(data => {
    res.send(data)
  }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving data sets."
      });
	});
    
}

const getById = async (req, res, next) => {
  const id = req.params.id;

	models.dataSets.findByPk(id)
	  .then(data => {
		    if(data)
				res.send(data);
			else
				res.send({message: "Error! We can't find id=" + id});	
	  })
	  .catch(err => {
		res.status(500).send({
		  message: "Error retrieving Data set with id=" + id
		});
	  });
}

const update = async (req, res, next) => {
  const id = req.params.id;
  models.dataSets.update(req.body, {
    where: {id: id}}
    ).then(num => {
      if(num == 1)
        res.send({message: `Id= ${id} was updated saccesfully`});
      else
      ;
    }).catch(err => {
      res.status(500).send({
        message: "Error updating Tutorial with id="+id
      })
    })
}

const deleteById = async (req, res, next) => {
  const id = req.params.id;
	models.dataSets.destroy({where: {id: id}})
	  .then(num => {
		if (num == 1) {
		  res.send({
			message: `Data set was deleted successfully!`
		  });
		} else {
		  res.send({
			message: `Cannot delete Data set with id=${id}. Maybe Task was not found!`
		  });
		}
	  })
	  .catch(err => {
		res.status(500).send({
		  message: "Could not delete Data set with id=" + id
		});
	  });
}

export default {
  prefix: '/data-sets',
  inject: (router) => {
    router.get('/list', getAll);
    router.get('/detail/:id', getById);
    router.post('/create', create);
    router.put('/update/:id', update);
    router.delete('/delete/:id', deleteById);
  }
}