import Joi from 'joi';

import models from '../../models';

const create_validation = {
  body: Joi.object({
    dataset_id: Joi.required(),
    value: Joi.required(),
  })
};

const add = async (req, res, next) => {
  
  const { error } = create_validation.body.validate(req.body);
  
  if (error) {
    return res.send(400, { error });
  }

  const { dataset_id, value} = req.body;
  let data;
  
  try {
    data = await models.datas.create({
      dataset_id,
      value
    });
  } 
  catch(err) {
    return res.status(400).send({message: err});
  }
 
  res.send(201, { data: data.toJSON()});
}

const getAll = async (req, res, next) => {

  const dataset_id  = req.params.id;
  
  try {
    var data = await models.datas.findAll({
      where: {dataset_id: dataset_id}
    });
    
    if(data.length == 0) {
      return res.send({result: [], count: 0})
    }
    
    return res.send({result: data, count: data.length})

  }catch (err) {
    return res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving datas.",
      result: [],
      count: 0
    });

  }    
}

const detail = async (req, res, next) => {
  
  const id = req.params.id;
  try {
    var data = await models.datas.findOne({ 
      where: { id: id }, 
      includes: [ 
        { 
          model: models.data_sets, 
          as: 'data', 
          required: true, 
          where: { userId: req.user.id } 
        } 
      ] 
    });
  
    if(data){
      return res.send(data);
    } 
    
    return res.send({message: `Error! No such data(id=${id}) or You don't have permission to see the this data`});
  
  } catch (err) {
    return res.status(500).send(err || {
      message: "Error retrieving Data with id=" + id
    });
  }
}

const update = async (req, res, next) => {
  const { id } = req.body;
  
  try {
    var data = await models.datas.findOne({
      where: { id: id }, 
      includes: [ 
        { 
          model: models.data_sets, 
          as: 'data', 
          required: true, 
          where: { userId: req.user.id } 
        } 
      ] 
    });
  
    if (data === null) {
      return res.send({
        err: `Error updating data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`
      })
    }
  
    var num = await models.datas.update(req.body, {
      where: { id: id }
    });

    if(num == 1) {
      return res.send({message: `Id= ${id} was updated saccesfully`});
    }
    else {
      return res.send({
        err: `Error updating data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`
      })
    } 
  } catch (err) {
    return res.send({
      err: `Error updating data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`
    })
  }
}

const deleteById = async (req, res, next) => {
  const id = req.params.id;

  try {
    var data = await models.datas.findOne({
      where: { id: id }, 
      includes: [ 
        { 
          model: models.data_sets, 
          as: 'data', 
          required: true, 
          where: { userId: req.user.id } 
        } 
      ] 
    });
  
    if (data === null) {
      return res.send({
        message: `Cannot delete Data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`
        });
    }
  
    var num = await models.datas.destroy({
      where: { id: id }
    });

    if (num == 1) {
      res.send({
      message: `Data was deleted successfully!`
      });
    } else {
      res.send({
      message: `Cannot delete Data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`
      });
    }
  } catch (err) {
    return res.send({
			message: `Cannot delete Data with id=${id}.No such data(id=${id}) or You don't have permission to see the this data`
		  });
  }
}

export default {
  prefix: '/datas',
  inject: (router) => {
    router.get('/:id', getAll);
    router.get('/details/:id', detail);
    router.post('/', add);
    router.put('/update', update);
    router.delete('/:id', deleteById);
  }
}