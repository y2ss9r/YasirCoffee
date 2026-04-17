const express = require('express');
const router = express.Router();
const { getOffers, redeem, generate } = require('../controllers/offerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getOffers);
router.post('/use/:id', protect, redeem);
router.post('/generate', protect, generate);

module.exports = router;
