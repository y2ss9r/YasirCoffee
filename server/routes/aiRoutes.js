const express = require('express');
const router = express.Router();
const { chat, resetChat, recommend } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Public chatbot endpoints
router.post('/chat', chat);
router.post('/reset', resetChat);

// Private recommendation endpoint
router.get('/recommend/:userId', protect, recommend);
router.get('/recommend', protect, (req, res, next) => {
    req.params.userId = req.user._id;
    recommend(req, res, next);
});

module.exports = router;
