const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const schemas = require('../middleware/schemas');

router.route('/')
    .get(getProducts)
    .post(protect, admin, validate(schemas.createProduct), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, validate(schemas.updateProduct), updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;

