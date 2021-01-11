import Joi, { required } from 'joi';
import models from '../../models';

const create_validation = {
  body: Joi.object({
    dataset_id: Joi.required(),
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
    permission_read: Joi.required(),
    permission_write: Joi.required(),
    permission_delete: Joi.required()
  }),
};

const create = async (req, res, next) => {
  const user_id = req.user.id;
  const { error, value } = create_validation.body.validate(req.body);
  if (error) {
    return res.send(400, { error });
  }

    const dataSet = await models.data_sets.findOne({
      where: {
        id: req.body.dataset_id,
        user_id,
      },
    });

    if (dataSet) {
      const newApplication = await models.application.create(req.body)
      return res.status(201).send({
        application: newApplication.toJSON()
      });
    }

   return res.status(400).send({
      err: err.message
    })


};

const detail = async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {



    const application = await models.application.findOne({
      where: {

        id,
      },
      include : [
        {
          model : models.data_sets,
          as : 'data_sets',
          where : {
            user_id : user_id
          },
          required : true
        }
      ]
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
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const application = await models.application.findOne({
      where: {
        id,
      },
      include : [
        {
          model : models.data_sets,
          as : 'data_sets',
          where : {
            user_id : user_id
          },
          required : true
        }
      ]
    });

    if (application) {
        models.application.update(req.body, {
          where: {
            id: application.id,
          },
        });
        res.send({
          message: `Id= ${id} was updated succesfully`,
        });

    }
    else {
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
  const { id } = req.params;
  const user_id = req.user.id;
  const application = await models.application.findOne({
    where: {
      id,

    },

    include : [
      {
        model : models.data_sets,
        as : 'data_sets',
        where : {
          user_id : user_id
        },
        required : true
      }
    ]

  });


  if (application) {

      models.application.destroy({
        where: {
          id,
        }
      });
      res.send({
        message: 'Data set was deleted successfully!',
      });
    dataSet.catch((err) => {
      res.status(500).send(err || {
        message: `Could NOT delete Data set with id= ${id}`,
      });
    });
  }
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
