import Joi from 'joi'

const schema = Joi.defaults((s) => {
    return s.options({ abortEarly: false })
})

export default schema