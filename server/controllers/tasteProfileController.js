const asyncHandler = require('express-async-handler');
const {
    updateTasteProfile,
    getTasteEvolution,
    initializeFromQuiz,
} = require('../services/tasteProfileService');
const User = require('../models/User');

// @desc    Get user's taste profile
// @route   GET /api/taste-profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('tasteProfile tasteHistory quizCompleted');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({
        tasteProfile: user.tasteProfile,
        quizCompleted: user.quizCompleted,
        historyCount: user.tasteHistory.length,
    });
});

// @desc    Get taste evolution history and predictions
// @route   GET /api/taste-profile/evolution
// @access  Private
const getEvolution = asyncHandler(async (req, res) => {
    const evolution = await getTasteEvolution(req.user._id);

    if (!evolution) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json(evolution);
});

// @desc    Update taste profile (from purchase or rating)
// @route   PUT /api/taste-profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { productId, trigger } = req.body;

    if (!productId) {
        res.status(400);
        throw new Error('Product ID is required');
    }

    const updated = await updateTasteProfile(req.user._id, productId, trigger || 'purchase');

    if (!updated) {
        res.status(404);
        throw new Error('User or product not found');
    }

    res.json({ tasteProfile: updated });
});

// @desc    Initialize profile from quiz results
// @route   POST /api/taste-profile/init
// @access  Private
const initProfile = asyncHandler(async (req, res) => {
    const { profile } = req.body;

    if (!profile) {
        res.status(400);
        throw new Error('Profile data is required');
    }

    const result = await initializeFromQuiz(req.user._id, profile);

    if (!result) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({ tasteProfile: result });
});

module.exports = { getProfile, getEvolution, updateProfile, initProfile };
