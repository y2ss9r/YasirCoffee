const Joi = require('joi');

const registerUser = Joi.object({
    name: Joi.string().trim().min(2).max(80).required(),
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().min(8).max(128).required()
        .messages({ 'string.min': 'Password must be at least 8 characters' }),
});

const loginUser = Joi.object({
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().min(1).required(),
});

const updateUser = Joi.object({
    name: Joi.string().trim().min(2).max(80),
    email: Joi.string().trim().email().lowercase(),
    password: Joi.string().min(8).max(128).allow(''),
});

const createProduct = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    price: Joi.number().min(0).required(),
    image: Joi.string().uri().required(),
    brand: Joi.string().min(1).max(100).required(),
    category: Joi.string().min(1).max(100).required(),
    countInStock: Joi.number().integer().min(0).required(),
    description: Joi.string().min(5).max(2000).required(),
    unitCost: Joi.number().min(0).required(),
    currency: Joi.string().valid('USD', 'TRY').default('USD'),
    slug: Joi.string().max(200).optional().allow(''),
});

const updateProduct = Joi.object({
    name: Joi.string().min(2).max(200),
    price: Joi.number().min(0),
    image: Joi.string().uri(),
    brand: Joi.string().min(1).max(100),
    category: Joi.string().min(1).max(100),
    countInStock: Joi.number().integer().min(0),
    description: Joi.string().min(5).max(2000),
    unitCost: Joi.number().min(0),
    currency: Joi.string().valid('USD', 'TRY'),
    slug: Joi.string().max(200).optional().allow(''),
});

module.exports = {
    registerUser,
    loginUser,
    updateUser,
    createProduct,
    updateProduct,
};
