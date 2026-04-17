const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    reviews: [],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    unitCost: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: 'USD', enum: ['USD', 'TRY'] },
    slug: { type: String, unique: true, index: true },

    // === AI Coffee DNA Attributes ===
    coffeeDNA: {
        bitterness:  { type: Number, default: 5, min: 0, max: 10 },
        acidity:     { type: Number, default: 5, min: 0, max: 10 },
        roastLevel:  { type: Number, default: 5, min: 0, max: 10 },
        body:        { type: Number, default: 5, min: 0, max: 10 },
        sweetness:   { type: Number, default: 5, min: 0, max: 10 },
        flavorNotes: [{ type: String }],
    },

    // === AI Dynamic Pricing ===
    dynamicPrice: { type: Number, default: null }, // AI-adjusted price, null = use base price
    demandScore:  { type: Number, default: 50 },    // 0-100, used by pricing engine
    salesVelocity: { type: Number, default: 0 },    // Units sold per day (rolling avg)

    // === Brewing method suggestion ===
    brewingMethods: [{ type: String }],
}, {
    timestamps: true,
});

productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
