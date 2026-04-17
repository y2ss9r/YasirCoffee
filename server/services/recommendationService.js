/**
 * Hybrid Recommendation Service
 * Feature 2: Combines collaborative filtering, content-based filtering,
 * and context-aware data with weighted scoring.
 */

const Product = require('../models/Product');
const UserActivity = require('../models/UserActivity');
const User = require('../models/User');
const { cosineSimilarity } = require('./chatbotService');

// ── Weights for hybrid scoring ──────────────────────────────────────
const WEIGHTS = {
    collaborative: 0.35,
    contentBased:  0.40,
    contextAware:  0.25,
};

// ── Content-Based Filtering ─────────────────────────────────────────
// Compare user taste profile to product coffeeDNA
const contentBasedScore = (userProfile, product) => {
    if (!userProfile || !product.coffeeDNA) return 0.5;

    const userVec = [
        userProfile.bitterness || 5,
        userProfile.acidity || 5,
        userProfile.roastLevel || 5,
        userProfile.body || 5,
        userProfile.sweetness || 5,
    ];
    const productVec = [
        product.coffeeDNA.bitterness,
        product.coffeeDNA.acidity,
        product.coffeeDNA.roastLevel,
        product.coffeeDNA.body,
        product.coffeeDNA.sweetness,
    ];

    return cosineSimilarity(userVec, productVec);
};

// ── Collaborative Filtering ─────────────────────────────────────────
// "Users who bought X also bought Y" — co-purchase analysis
const getCollaborativeScores = async (userId, products) => {
    // Get products this user has purchased
    const userPurchases = await UserActivity.find({
        user: userId,
        type: 'purchase',
    }).distinct('product');

    if (userPurchases.length === 0) {
        return products.map(() => 0.5); // Neutral score for new users
    }

    // Find other users who purchased the same products
    const similarUsers = await UserActivity.find({
        product: { $in: userPurchases },
        type: 'purchase',
        user: { $ne: userId },
    }).distinct('user');

    if (similarUsers.length === 0) {
        return products.map(() => 0.5);
    }

    // Find what those similar users also purchased
    const coPurchases = await UserActivity.aggregate([
        {
            $match: {
                user: { $in: similarUsers },
                type: 'purchase',
                product: { $nin: userPurchases }, // Exclude already purchased
            },
        },
        {
            $group: {
                _id: '$product',
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);

    const maxCount = coPurchases.length > 0 ? coPurchases[0].count : 1;
    const scoreMap = {};
    coPurchases.forEach(cp => {
        scoreMap[cp._id.toString()] = cp.count / maxCount;
    });

    return products.map(p => scoreMap[p._id.toString()] || 0.3);
};

// ── Context-Aware Scoring ───────────────────────────────────────────
// Adjust scores based on time of day, season, and day of week
const contextAwareScore = (product) => {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();

    let score = 0.5;

    // Time of day preferences
    if (hour >= 5 && hour < 10) {
        // Morning: prefer strong, high-body coffees
        score += (product.coffeeDNA.body / 10) * 0.2;
        score += (product.coffeeDNA.roastLevel / 10) * 0.1;
    } else if (hour >= 10 && hour < 14) {
        // Midday: balanced coffees
        score += 0.1;
    } else if (hour >= 14 && hour < 18) {
        // Afternoon: lighter, sweeter options
        score += (product.coffeeDNA.sweetness / 10) * 0.2;
    } else {
        // Evening: mild, low-acidity
        score += ((10 - product.coffeeDNA.acidity) / 10) * 0.15;
        score += ((10 - product.coffeeDNA.bitterness) / 10) * 0.1;
    }

    // Seasonal adjustments
    if (month >= 5 && month <= 8) {
        // Summer: prefer cold, refreshing
        if (product.category === 'Cold') score += 0.2;
        if (product.coffeeDNA.sweetness > 6) score += 0.1;
    } else if (month >= 10 || month <= 2) {
        // Winter: prefer warm, strong, traditional
        if (product.category === 'Traditional') score += 0.15;
        if (product.coffeeDNA.body > 6) score += 0.1;
    }

    return Math.min(score, 1.0);
};

// ── Main Recommendation Function ────────────────────────────────────
const getRecommendations = async (userId, limit = 6) => {
    const user = await User.findById(userId);
    const products = await Product.find({});

    if (!user || products.length === 0) {
        return products.slice(0, limit);
    }

    // Calculate all three scoring dimensions
    const collaborativeScores = await getCollaborativeScores(userId, products);

    const scored = products.map((product, idx) => {
        const cbScore   = contentBasedScore(user.tasteProfile, product);
        const collabScore = collaborativeScores[idx];
        const ctxScore  = contextAwareScore(product);

        const finalScore = (
            WEIGHTS.collaborative * collabScore +
            WEIGHTS.contentBased  * cbScore +
            WEIGHTS.contextAware  * ctxScore
        );

        return {
            product,
            scores: {
                collaborative: Math.round(collabScore * 100),
                contentBased:  Math.round(cbScore * 100),
                contextAware:  Math.round(ctxScore * 100),
                final:         Math.round(finalScore * 100),
            },
        };
    });

    // Sort by final score and return top N
    scored.sort((a, b) => b.scores.final - a.scores.final);
    return scored.slice(0, limit);
};

module.exports = { getRecommendations, contentBasedScore, contextAwareScore };
