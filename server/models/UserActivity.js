const mongoose = require('mongoose');

const userActivitySchema = mongoose.Schema({
    user:    { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },

    // Activity type
    type: {
        type: String,
        required: true,
        enum: ['view', 'purchase', 'rating', 'search', 'cart_add', 'quiz_complete', 'chatbot_interaction'],
        index: true,
    },

    // Additional data
    rating:      { type: Number, min: 1, max: 5 },
    searchQuery: { type: String },
    quantity:    { type: Number, default: 1 },
    metadata:    { type: mongoose.Schema.Types.Mixed }, // Flexible extra data

    // Timestamp
    timestamp: { type: Date, default: Date.now, index: true },
}, {
    timestamps: true,
});

// Compound indexes for efficient querying
userActivitySchema.index({ user: 1, type: 1, timestamp: -1 });
userActivitySchema.index({ product: 1, type: 1, timestamp: -1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
module.exports = UserActivity;
