const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },

    // Offer details
    title:       { type: String, required: true },
    description: { type: String },
    discountPct: { type: Number, required: true, min: 1, max: 100 },
    code:        { type: String, unique: true },

    // Targeting
    reason: {
        type: String,
        required: true,
        enum: ['inactivity', 'loyalty', 'cart_abandonment', 'cross_sell', 'welcome', 'seasonal'],
    },

    // Applicable products (empty = all products)
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Validity
    expiresAt: { type: Date, required: true, index: true },
    isUsed:    { type: Boolean, default: false },
    usedAt:    { type: Date },

    // Minimum order for eligibility
    minOrderAmount: { type: Number, default: 0 },
}, {
    timestamps: true,
});

// Auto-generate unique code before save
offerSchema.pre('save', async function () {
    if (!this.code) {
        const prefix = this.reason.substring(0, 3).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.code = `${prefix}-${random}`;
    }
});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
