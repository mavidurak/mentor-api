import Joi from 'joi';

import models from '../../models';

const create_validation = {
  body: Joi.object({
    dataset_id: Joi.required(),
    value: Joi.required(),
  })
};

const create = async (req, res, next) => {
  const { error } = create_validation.body.validate(req.body);
  if (error) {
    return res.send(400, { error });
  }

  const { dataset_id, value} = req.body;

  data = await models.datas.create({
    dataset_id,
    value
  });

  res.send(201, { data: data.toJSON()});
}

const list = async (req, res, next) => {
  const {dataset_id} = req.body;
  models.datas.findAll({
    where: {dataset_id: dataset_id}
  }).then(data => {
    if(data.length == 0)
      return res.send({message: "You don't have a datas"})
    res.send(data)
  }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving datas."
      });
	});
    
}

const detail = async (req, res, next) => {
  const id = req.params.id;
  const { dataset_id } = req.body;
	models.datas.findOne({where: {
    dataset_id: dataset_id,
    id: id
  }})
	  .then(data => {
		    if(data)
				res.send(data);
      else
        res.send({err: `Error! No such data(id=${id}) or You don't have permission to see the this data set`});
	  })
	  .catch(err => {
		res.status(500).send(err || {
		  message: "Error retrieving Data with id=" + id
		});
	  });
}

const update = async (req, res, next) => {
  const id = req.params.id;
  models.datas.update(req.body, {where: {
    id: id
  }}
    ).then(num => {
      if(num == 1)
        res.send({message: `Id= ${id} was updated saccesfully`});
      else
      res.send({
        err: `Error updating data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`
      })
    }).catch(err => {
      res.status(500).send(err || {
        message: "Could not update Data with id=" + id
      })
    })
}

const deleteById = async (req, res, next) => {
  const id = req.params.id;
	models.datas.destroy({where: {
    id: id
  }})
	  .then(num => {
		if (num == 1) {
		  res.send({
			message: `Data was deleted successfully!`
		  });
		} else {
		  res.send({
			message: `Cannot delete Data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`
		  });
		}
	  })
	  .catch(err => {
		res.status(500).send(err || {
		  message: "Could not delete Data with id=" + id
		});
	  });
}

export default {
  prefix: '/datas',
  inject: (router) => {
    router.get('/list', list);
    router.get('/detail/:id', detail);
    router.post('/create', create);
    router.put('/update/:id', update);
    router.delete('/delete/:id', deleteById);
  }
}