/**
 * Reusable Joi validation middleware factory.
 * Usage: router.post('/', validate(schema), controller)
 */
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400);
        const message = error.details.map((d) => d.message).join(', ');
        return next(new Error(message));
    }
    next();
};

module.exports = validate;
