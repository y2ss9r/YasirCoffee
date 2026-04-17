const express = require('express');
const router = express.Router();
const {
    getDashboard, getStagnation, getPricing, applyPricing, getForecast,
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, admin, getDashboard);
router.get('/stagnation', protect, admin, getStagnation);
router.get('/pricing', protect, admin, getPricing);
router.post('/pricing/apply', protect, admin, applyPricing);
router.get('/forecast/:productId', protect, admin, getForecast);

module.exports = router;
