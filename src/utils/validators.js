import Joi from 'joi';

// Common
const objectId = Joi.string().hex().length(24);

// Product schemas
export const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').max(5000).optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().allow('').max(200).optional(),
  stock: Joi.number().integer().min(0).optional(),
  images: Joi.array().items(Joi.string().uri().allow('')).optional(),
  isActive: Joi.boolean().optional(),
}).unknown(false);

export const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  description: Joi.string().allow('').max(5000),
  price: Joi.number().min(0),
  category: Joi.string().allow('').max(200),
  stock: Joi.number().integer().min(0),
  images: Joi.array().items(Joi.string().uri().allow('')),
  isActive: Joi.boolean(),
})
  .min(1)
  .unknown(false);

// Cart schemas
export const addToCartSchema = Joi.object({
  productId: objectId.required(),
  quantity: Joi.number().integer().min(1).optional(),
}).unknown(false);

// Validation middleware factory
export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => ({ message: d.message, path: d.path })),
      });
    }
    req.body = value;
    return next();
  };
}
