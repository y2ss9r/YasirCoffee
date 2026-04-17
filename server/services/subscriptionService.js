/**
 * Smart Subscription & Refill Service
 * Feature 10: Subscription management with AI-powered auto-adjustment
 * of product selection based on evolving user taste profiles.
 */

const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const User = require('../models/User');
const { contentBasedScore } = require('./recommendationService');

// ── Frequency to Days Mapping ───────────────────────────────────────
const FREQUENCY_DAYS = {
    weekly: 7,
    biweekly: 14,
    monthly: 30,
};

// ── Create Subscription ─────────────────────────────────────────────
const createSubscription = async (userId, data) => {
    const { name, frequency, products, autoAdjust, shippingAddress } = data;

    // Calculate next delivery
    const nextDelivery = new Date();
    nextDelivery.setDate(nextDelivery.getDate() + (FREQUENCY_DAYS[frequency] || 30));

    const subscription = await Subscription.create({
        user: userId,
        name: name || 'My Coffee Subscription',
        frequency,
        products: products.map(p => ({ product: p.productId, quantity: p.quantity || 1 })),
        autoAdjust: autoAdjust !== false,
        nextDelivery,
        shippingAddress,
    });

    return subscription.populate('products.product', 'name image price slug');
};

// ── Get User Subscriptions ──────────────────────────────────────────
const getUserSubscriptions = async (userId) => {
    return Subscription.find({ user: userId })
        .populate('products.product', 'name image price slug coffeeDNA')
        .sort({ createdAt: -1 });
};

// ── Update Subscription ─────────────────────────────────────────────
const updateSubscription = async (subscriptionId, userId, updates) => {
    const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId });
    if (!subscription) return null;

    if (updates.frequency) {
        subscription.frequency = updates.frequency;
        subscription.nextDelivery = new Date();
        subscription.nextDelivery.setDate(
            subscription.nextDelivery.getDate() + (FREQUENCY_DAYS[updates.frequency] || 30)
        );
    }
    if (updates.products) {
        subscription.products = updates.products.map(p => ({
            product: p.productId,
            quantity: p.quantity || 1,
        }));
    }
    if (updates.name) subscription.name = updates.name;
    if (updates.autoAdjust !== undefined) subscription.autoAdjust = updates.autoAdjust;
    if (updates.status) subscription.status = updates.status;
    if (updates.shippingAddress) subscription.shippingAddress = updates.shippingAddress;

    await subscription.save();
    return subscription.populate('products.product', 'name image price slug coffeeDNA');
};

// ── Cancel Subscription ─────────────────────────────────────────────
const cancelSubscription = async (subscriptionId, userId) => {
    const subscription = await Subscription.findOne({ _id: subscriptionId, user: userId });
    if (!subscription) return null;

    subscription.status = 'cancelled';
    await subscription.save();
    return subscription;
};

// ── AI Auto-Adjust Products ─────────────────────────────────────────
// Checks if user's taste profile has evolved and adjusts subscription products
const autoAdjustSubscription = async (subscriptionId) => {
    const subscription = await Subscription.findById(subscriptionId)
        .populate('products.product');

    if (!subscription || !subscription.autoAdjust || subscription.status !== 'active') {
        return null;
    }

    const user = await User.findById(subscription.user);
    if (!user) return null;

    const allProducts = await Product.find({});

    // Score all products against current taste profile
    const scored = allProducts.map(p => ({
        product: p,
        score: contentBasedScore(user.tasteProfile, p),
    })).sort((a, b) => b.score - a.score);

    // Get current subscription product IDs
    const currentIds = subscription.products.map(p =>
        p.product._id ? p.product._id.toString() : p.product.toString()
    );

    // Check if top products differ from current selection
    const topProducts = scored.slice(0, subscription.products.length);
    const topIds = topProducts.map(s => s.product._id.toString());

    const needsAdjustment = !currentIds.every(id => topIds.includes(id));

    if (needsAdjustment) {
        // Record adjustment history
        subscription.adjustmentHistory.push({
            date: new Date(),
            oldProducts: currentIds,
            newProducts: topIds,
            reason: 'Taste profile evolution detected',
        });

        // Update products
        subscription.products = topProducts.map(s => ({
            product: s.product._id,
            quantity: 1,
        }));
        subscription.lastAdjusted = new Date();
        await subscription.save();

        return {
            adjusted: true,
            reason: 'Your taste profile has evolved! We\'ve updated your subscription.',
            newProducts: topProducts.map(s => ({
                name: s.product.name,
                score: Math.round(s.score * 100),
            })),
        };
    }

    return { adjusted: false, reason: 'Your subscription already matches your current preferences.' };
};

// ── Get Smart Suggestions ───────────────────────────────────────────
// Suggest products to add/swap in subscription based on current taste
const getSmartSuggestions = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return [];

    const allProducts = await Product.find({});
    const subscriptions = await Subscription.find({ user: userId, status: 'active' });

    // Collect all subscribed product IDs
    const subscribedIds = new Set();
    subscriptions.forEach(sub => {
        sub.products.forEach(p => subscribedIds.add(p.product.toString()));
    });

    // Score unsubscribed products
    const suggestions = allProducts
        .filter(p => !subscribedIds.has(p._id.toString()))
        .map(p => ({
            product: {
                _id: p._id,
                name: p.name,
                image: p.image,
                price: p.price,
                slug: p.slug,
                category: p.category,
            },
            matchScore: Math.round(contentBasedScore(user.tasteProfile, p) * 100),
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 4);

    return suggestions;
};

module.exports = {
    createSubscription,
    getUserSubscriptions,
    updateSubscription,
    cancelSubscription,
    autoAdjustSubscription,
    getSmartSuggestions,
};
