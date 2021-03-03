import Joi from 'joi';

const instance = Joi.defaults((s) => s.options({ abortEarly: false }));

export default instance;
