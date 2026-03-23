const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true, index: true }, // Indexed for performance
    description: { type: String, required: true },
    reviews: [], // Placeholder for review schema
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    unitCost: { type: Number, required: true, default: 0 }, // For profit calculation
    countInStock: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: 'USD', enum: ['USD', 'TRY'] }, // Display currency
    slug: { type: String, unique: true, index: true }, // For SEO friendly URLs
}, {
    timestamps: true,
});

// Compound index if needed? For now single field index on category and slug is sufficient.
productSchema.index({ name: 'text', description: 'text' }); // Text search index

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
