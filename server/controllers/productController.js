const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Fetch products with pagination and keyword search
// @route   GET /api/products?keyword=&pageNumber=
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const PAGE_SIZE = 12;
    const page = Math.max(Number(req.query.pageNumber) || 1, 1);

    const keyword = req.query.keyword
        ? { $text: { $search: req.query.keyword } }
        : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
        .limit(PAGE_SIZE)
        .skip(PAGE_SIZE * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / PAGE_SIZE), count });
});


// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        image,
        brand,
        category,
        countInStock,
        description,
        unitCost,
        currency,
        slug,
    } = req.body;

    const product = new Product({
        name,
        price,
        user: req.user._id,
        image,
        brand,
        category,
        countInStock,
        description,
        unitCost,
        currency: currency || 'TRY',
        slug,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        image,
        brand,
        category,
        countInStock,
        description,
        unitCost,
        currency,
        slug,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        if (name !== undefined) product.name = name;
        if (price !== undefined) product.price = price;
        if (image !== undefined) product.image = image;
        if (brand !== undefined) product.brand = brand;
        if (category !== undefined) product.category = category;
        if (countInStock !== undefined) product.countInStock = countInStock;
        if (description !== undefined) product.description = description;
        if (unitCost !== undefined) product.unitCost = unitCost;
        if (currency !== undefined) product.currency = currency;
        if (slug !== undefined) product.slug = slug;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
