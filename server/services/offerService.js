/**
 * Personalized Offers Engine
 * Feature 8: Generates personalized discounts and offers based on
 * user behavior, inactivity periods, and purchase history.
 */

const User = require('../models/User');
const Offer = require('../models/Offer');
const Product = require('../models/Product');
const UserActivity = require('../models/UserActivity');
const { contentBasedScore } = require('./recommendationService');

// ── Configuration ───────────────────────────────────────────────────
const OFFER_CONFIG = {
    inactivityDays: 7,       // Days of inactivity to trigger win-back
    loyaltyThreshold: 10,    // Purchases to qualify as loyal
    inactivityDiscount: 15,  // % off for inactive users
    loyaltyDiscount: 10,     // % off for loyal customers
    crossSellDiscount: 12,   // % off for cross-sell
    welcomeDiscount: 20,     // % off for new users
    offerValidDays: 7,       // How long offers are valid
};

// ── Generate Inactivity Offers ──────────────────────────────────────
const generateInactivityOffers = async () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - OFFER_CONFIG.inactivityDays);

    // Find inactive users
    const inactiveUsers = await User.find({
        isAdmin: false,
        lastActive: { $lt: cutoffDate },
    });

    const offers = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + OFFER_CONFIG.offerValidDays);

    for (const user of inactiveUsers) {
        // Check if user already has an active inactivity offer
        const existingOffer = await Offer.findOne({
            user: user._id,
            reason: 'inactivity',
            isUsed: false,
            expiresAt: { $gt: new Date() },
        });

        if (!existingOffer) {
            // Get products matching user's taste profile for targeted offer
            const products = await Product.find({});
            const bestMatch = products
                .map(p => ({ product: p, score: contentBasedScore(user.tasteProfile, p) }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            const offer = await Offer.create({
                user: user._id,
                title: `We miss you! ${OFFER_CONFIG.inactivityDiscount}% off your favorites`,
                description: `It's been a while since your last visit. Here's a special discount on coffees we think you'll love!`,
                discountPct: OFFER_CONFIG.inactivityDiscount,
                reason: 'inactivity',
                products: bestMatch.map(m => m.product._id),
                expiresAt,
            });
            offers.push(offer);
        }
    }

    return offers;
};

// ── Generate Loyalty Rewards ────────────────────────────────────────
const generateLoyaltyOffers = async () => {
    const loyalUsers = await User.find({
        isAdmin: false,
        purchaseCount: { $gte: OFFER_CONFIG.loyaltyThreshold },
    });

    const offers = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + OFFER_CONFIG.offerValidDays);

    for (const user of loyalUsers) {
        const existingOffer = await Offer.findOne({
            user: user._id,
            reason: 'loyalty',
            isUsed: false,
            expiresAt: { $gt: new Date() },
        });

        if (!existingOffer) {
            const offer = await Offer.create({
                user: user._id,
                title: `Loyal Customer Reward — ${OFFER_CONFIG.loyaltyDiscount}% Off`,
                description: `Thank you for your ${user.purchaseCount} purchases! Here's a reward for being a valued customer.`,
                discountPct: OFFER_CONFIG.loyaltyDiscount,
                reason: 'loyalty',
                products: [], // Applies to all products
                expiresAt,
            });
            offers.push(offer);
        }
    }

    return offers;
};

// ── Generate Cross-Sell Offers ──────────────────────────────────────
const generateCrossSellOffers = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return [];

    // Find products user hasn't purchased
    const purchasedIds = await UserActivity.find({
        user: userId, type: 'purchase',
    }).distinct('product');

    const unseenProducts = await Product.find({
        _id: { $nin: purchasedIds },
    });

    if (unseenProducts.length === 0) return [];

    // Score by taste profile similarity
    const recommendations = unseenProducts
        .map(p => ({ product: p, score: contentBasedScore(user.tasteProfile, p) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + OFFER_CONFIG.offerValidDays);

    const offers = [];
    for (const rec of recommendations) {
        const offer = await Offer.create({
            user: userId,
            title: `Try ${rec.product.name} — ${OFFER_CONFIG.crossSellDiscount}% Off`,
            description: `Based on your Coffee DNA, we think you'd love ${rec.product.name}!`,
            discountPct: OFFER_CONFIG.crossSellDiscount,
            reason: 'cross_sell',
            products: [rec.product._id],
            expiresAt,
        });
        offers.push(offer);
    }

    return offers;
};

// ── Get Active Offers for User ──────────────────────────────────────
const getUserOffers = async (userId) => {
    const offers = await Offer.find({
        user: userId,
        isUsed: false,
        expiresAt: { $gt: new Date() },
    }).populate('products', 'name image price slug');

    return offers;
};

// ── Use an Offer ────────────────────────────────────────────────────
const useOffer = async (offerId, userId) => {
    const offer = await Offer.findOne({
        _id: offerId,
        user: userId,
        isUsed: false,
        expiresAt: { $gt: new Date() },
    });

    if (!offer) return null;

    offer.isUsed = true;
    offer.usedAt = new Date();
    await offer.save();

    return offer;
};

module.exports = {
    generateInactivityOffers,
    generateLoyaltyOffers,
    generateCrossSellOffers,
    getUserOffers,
    useOffer,
};
