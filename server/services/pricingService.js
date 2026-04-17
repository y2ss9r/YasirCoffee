/**
 * Smart Dynamic Pricing Service
 * Feature 6: Adjusts product prices based on demand, user behavior,
 * and sales trends. Includes price floors and ceilings.
 */

const Product = require('../models/Product');
const UserActivity = require('../models/UserActivity');

// ── Pricing Configuration ───────────────────────────────────────────
const CONFIG = {
    minMarginPct: 20,        // Minimum margin above unit cost (%)
    maxMarkupPct: 50,        // Maximum markup above base price (%)
    highDemandThreshold: 70, // Demand score above this → price increase
    lowDemandThreshold: 30,  // Demand score below this → discount
    maxIncreaseRate: 0.15,   // Max 15% price increase
    maxDecreaseRate: 0.25,   // Max 25% price decrease
};

// ── Calculate Demand Score (0-100) ──────────────────────────────────
const calculateDemandScore = async (productId) => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Get recent views and purchases
    const [views, purchases, cartAdds] = await Promise.all([
        UserActivity.countDocuments({ product: productId, type: 'view', timestamp: { $gte: weekAgo } }),
        UserActivity.countDocuments({ product: productId, type: 'purchase', timestamp: { $gte: weekAgo } }),
        UserActivity.countDocuments({ product: productId, type: 'cart_add', timestamp: { $gte: weekAgo } }),
    ]);

    // Weighted demand score
    const rawScore = (views * 1) + (cartAdds * 3) + (purchases * 10);

    // Normalize to 0-100 (assuming max reasonable activity)
    const normalized = Math.min(100, (rawScore / 50) * 100);

    return Math.round(normalized);
};

// ── View-to-Purchase Conversion Rate ────────────────────────────────
const getConversionRate = async (productId) => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const views = await UserActivity.countDocuments({
        product: productId, type: 'view', timestamp: { $gte: weekAgo },
    });
    const purchases = await UserActivity.countDocuments({
        product: productId, type: 'purchase', timestamp: { $gte: weekAgo },
    });

    if (views === 0) return 0;
    return purchases / views;
};

// ── Calculate Dynamic Price for a Product ───────────────────────────
const calculateDynamicPrice = async (productId) => {
    const product = await Product.findById(productId);
    if (!product) return null;

    const demandScore = await calculateDemandScore(productId);
    const conversionRate = await getConversionRate(productId);

    const basePrice = product.price;
    const unitCost = product.unitCost;
    const minPrice = unitCost * (1 + CONFIG.minMarginPct / 100);
    const maxPrice = basePrice * (1 + CONFIG.maxMarkupPct / 100);

    let adjustmentFactor = 0;
    let reason = 'stable demand';

    if (demandScore >= CONFIG.highDemandThreshold) {
        // High demand: increase price
        const intensity = (demandScore - CONFIG.highDemandThreshold) / (100 - CONFIG.highDemandThreshold);
        adjustmentFactor = intensity * CONFIG.maxIncreaseRate;
        reason = 'high demand — price increased';
    } else if (demandScore <= CONFIG.lowDemandThreshold) {
        // Low demand: decrease price
        const intensity = (CONFIG.lowDemandThreshold - demandScore) / CONFIG.lowDemandThreshold;
        adjustmentFactor = -intensity * CONFIG.maxDecreaseRate;
        reason = 'low demand — price discounted';
    }

    // Conversion rate bonus: high conversion but not too high demand → slight increase
    if (conversionRate > 0.3 && demandScore < CONFIG.highDemandThreshold) {
        adjustmentFactor += 0.05;
        reason += ' + high conversion rate';
    }

    // Apply time-based promotions
    const hour = new Date().getHours();
    if (hour >= 14 && hour <= 16) {
        adjustmentFactor -= 0.05; // Happy hour discount
        reason += ' + happy hour';
    }

    // Calculate final price
    let dynamicPrice = basePrice * (1 + adjustmentFactor);
    dynamicPrice = Math.max(minPrice, Math.min(maxPrice, dynamicPrice));
    dynamicPrice = Math.round(dynamicPrice * 100) / 100;

    return {
        productId: product._id,
        name: product.name,
        basePrice,
        dynamicPrice,
        adjustmentPct: Math.round(adjustmentFactor * 100),
        demandScore,
        conversionRate: Math.round(conversionRate * 100),
        reason,
        priceFloor: Math.round(minPrice * 100) / 100,
        priceCeiling: Math.round(maxPrice * 100) / 100,
    };
};

// ── Get Pricing Suggestions for All Products ────────────────────────
const getPricingSuggestions = async () => {
    const products = await Product.find({});

    const suggestions = await Promise.all(
        products.map(p => calculateDynamicPrice(p._id))
    );

    return {
        suggestions: suggestions.filter(Boolean),
        generated: new Date().toISOString(),
    };
};

// ── Apply Dynamic Prices to Products ────────────────────────────────
const applyDynamicPrices = async () => {
    const products = await Product.find({});
    const results = [];

    for (const product of products) {
        const pricing = await calculateDynamicPrice(product._id);
        if (pricing) {
            product.dynamicPrice = pricing.dynamicPrice;
            product.demandScore = pricing.demandScore;
            await product.save();
            results.push(pricing);
        }
    }

    return results;
};

module.exports = {
    calculateDynamicPrice,
    getPricingSuggestions,
    applyDynamicPrices,
    calculateDemandScore,
};
