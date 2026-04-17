const asyncHandler = require('express-async-handler');
const {
    createSubscription,
    getUserSubscriptions,
    updateSubscription,
    cancelSubscription,
    autoAdjustSubscription,
    getSmartSuggestions,
} = require('../services/subscriptionService');

// @desc    Get user's subscriptions
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = asyncHandler(async (req, res) => {
    const subscriptions = await getUserSubscriptions(req.user._id);
    res.json({ subscriptions });
});

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private
const create = asyncHandler(async (req, res) => {
    const subscription = await createSubscription(req.user._id, req.body);
    res.status(201).json(subscription);
});

// @desc    Update a subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const update = asyncHandler(async (req, res) => {
    const subscription = await updateSubscription(req.params.id, req.user._id, req.body);

    if (!subscription) {
        res.status(404);
        throw new Error('Subscription not found');
    }

    res.json(subscription);
});

// @desc    Cancel a subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const cancel = asyncHandler(async (req, res) => {
    const subscription = await cancelSubscription(req.params.id, req.user._id);

    if (!subscription) {
        res.status(404);
        throw new Error('Subscription not found');
    }

    res.json({ message: 'Subscription cancelled' });
});

// @desc    AI auto-adjust subscription
// @route   POST /api/subscriptions/:id/adjust
// @access  Private
const adjust = asyncHandler(async (req, res) => {
    const result = await autoAdjustSubscription(req.params.id);

    if (!result) {
        res.status(404);
        throw new Error('Subscription not found or not eligible for adjustment');
    }

    res.json(result);
});

// @desc    Get smart product suggestions
// @route   GET /api/subscriptions/suggestions
// @access  Private
const suggestions = asyncHandler(async (req, res) => {
    const result = await getSmartSuggestions(req.user._id);
    res.json({ suggestions: result });
});

module.exports = { getSubscriptions, create, update, cancel, adjust, suggestions };
