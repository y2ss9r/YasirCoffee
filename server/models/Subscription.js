const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },

    // Subscription details
    name: { type: String, default: 'My Coffee Subscription' },
    frequency: {
        type: String,
        required: true,
        enum: ['weekly', 'biweekly', 'monthly'],
        default: 'monthly',
    },

    // Selected products
    products: [{
        product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 1, min: 1 },
    }],

    // Status
    status: {
        type: String,
        enum: ['active', 'paused', 'cancelled'],
        default: 'active',
        index: true,
    },

    // AI features
    autoAdjust: { type: Boolean, default: true }, // Auto-adjust based on taste evolution
    lastAdjusted: { type: Date },
    adjustmentHistory: [{
        date: { type: Date, default: Date.now },
        oldProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        newProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        reason: String,
    }],

    // Delivery schedule
    nextDelivery:   { type: Date },
    lastDelivery:   { type: Date },
    deliveryCount:  { type: Number, default: 0 },

    // Shipping
    shippingAddress: {
        address:    { type: String },
        city:       { type: String },
        postalCode: { type: String },
        country:    { type: String },
    },
}, {
    timestamps: true,
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
