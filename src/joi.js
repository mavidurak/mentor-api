import Joi from 'joi'

const instance = Joi.defaults((s) => {
  return s.options({ abortEarly: false })
})

export default instance
