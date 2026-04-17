/**
 * Taste Profile Service — Coffee DNA Manager
 * Features 3 & 4: User taste profile management and taste evolution tracking.
 * Uses exponential moving average for profile updates and linear trend extrapolation
 * for predicting future taste preferences.
 */

const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const Product = require('../models/Product');

// ── EMA smoothing factor (0 < α < 1) ───────────────────────────────
// Higher α = more weight to recent data
const ALPHA = 0.3;

// ── Update Taste Profile Using EMA ──────────────────────────────────
const updateTasteProfile = async (userId, productId, trigger = 'purchase') => {
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product || !product.coffeeDNA) return null;

    const current = user.tasteProfile;
    const productDNA = product.coffeeDNA;

    // Exponential Moving Average update
    const updated = {
        bitterness:  Math.round((ALPHA * productDNA.bitterness  + (1 - ALPHA) * current.bitterness) * 10) / 10,
        acidity:     Math.round((ALPHA * productDNA.acidity     + (1 - ALPHA) * current.acidity) * 10) / 10,
        roastLevel:  Math.round((ALPHA * productDNA.roastLevel  + (1 - ALPHA) * current.roastLevel) * 10) / 10,
        body:        Math.round((ALPHA * productDNA.body        + (1 - ALPHA) * current.body) * 10) / 10,
        sweetness:   Math.round((ALPHA * productDNA.sweetness   + (1 - ALPHA) * current.sweetness) * 10) / 10,
    };

    // Save snapshot to history
    user.tasteHistory.push({
        date: new Date(),
        profile: { ...updated },
        trigger,
    });

    // Keep only last 50 history entries
    if (user.tasteHistory.length > 50) {
        user.tasteHistory = user.tasteHistory.slice(-50);
    }

    user.tasteProfile = updated;
    user.lastActive = new Date();
    await user.save();

    return updated;
};

// ── Initialize Profile from Quiz ────────────────────────────────────
const initializeFromQuiz = async (userId, quizProfile) => {
    const user = await User.findById(userId);
    if (!user) return null;

    user.tasteProfile = {
        bitterness:  quizProfile.bitterness,
        acidity:     quizProfile.acidity,
        roastLevel:  quizProfile.roastLevel,
        body:        quizProfile.body,
        sweetness:   quizProfile.sweetness,
    };

    user.tasteHistory.push({
        date: new Date(),
        profile: { ...user.tasteProfile },
        trigger: 'quiz',
    });

    user.quizCompleted = true;
    user.lastActive = new Date();
    await user.save();

    return user.tasteProfile;
};

// ── Get Taste Evolution History ─────────────────────────────────────
const getTasteEvolution = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return null;

    return {
        currentProfile: user.tasteProfile,
        history: user.tasteHistory.sort((a, b) => new Date(a.date) - new Date(b.date)),
        prediction: predictFutureTaste(user.tasteHistory),
    };
};

// ── Predict Future Taste (Linear Trend) ─────────────────────────────
// Feature 4: Simple linear regression on each dimension
const predictFutureTaste = (history) => {
    if (!history || history.length < 3) return null;

    const recent = history.slice(-10); // Use last 10 data points
    const n = recent.length;
    const dims = ['bitterness', 'acidity', 'roastLevel', 'body', 'sweetness'];
    const prediction = {};

    dims.forEach(dim => {
        const values = recent.map((h, i) => ({ x: i, y: h.profile[dim] }));

        // Linear regression: y = mx + b
        const sumX  = values.reduce((s, v) => s + v.x, 0);
        const sumY  = values.reduce((s, v) => s + v.y, 0);
        const sumXY = values.reduce((s, v) => s + v.x * v.y, 0);
        const sumX2 = values.reduce((s, v) => s + v.x * v.x, 0);

        const denom = n * sumX2 - sumX * sumX;
        if (denom === 0) {
            prediction[dim] = values[values.length - 1].y;
            return;
        }

        const m = (n * sumXY - sumX * sumY) / denom;
        const b = (sumY - m * sumX) / n;

        // Predict 3 steps ahead
        const predicted = m * (n + 3) + b;
        prediction[dim] = Math.max(0, Math.min(10, Math.round(predicted * 10) / 10));
    });

    return {
        predictedProfile: prediction,
        direction: Object.keys(prediction).reduce((acc, dim) => {
            const current = recent[recent.length - 1].profile[dim];
            const diff = prediction[dim] - current;
            acc[dim] = diff > 0.3 ? 'increasing' : diff < -0.3 ? 'decreasing' : 'stable';
            return acc;
        }, {}),
    };
};

module.exports = {
    updateTasteProfile,
    initializeFromQuiz,
    getTasteEvolution,
    predictFutureTaste,
};
