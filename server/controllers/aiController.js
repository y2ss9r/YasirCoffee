const asyncHandler = require('express-async-handler');
const { processMessage, resetSession } = require('../services/chatbotService');
const { getRecommendations } = require('../services/recommendationService');

// @desc    Chat with AI Coffee Assistant
// @route   POST /api/ai/chat
// @access  Public
const chat = asyncHandler(async (req, res) => {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
        res.status(400);
        throw new Error('Message and sessionId are required');
    }

    const response = await processMessage(sessionId, message);
    res.json(response);
});

// @desc    Reset chatbot session
// @route   POST /api/ai/reset
// @access  Public
const resetChat = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    if (sessionId) resetSession(sessionId);
    res.json({ message: 'Session reset' });
});

// @desc    Get personalized recommendations for user
// @route   GET /api/ai/recommend/:userId
// @access  Private
const recommend = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user?._id;
    const limit = parseInt(req.query.limit) || 6;

    const recommendations = await getRecommendations(userId, limit);
    res.json({ recommendations });
});

module.exports = { chat, resetChat, recommend };
