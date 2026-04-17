const express = require('express');
const router = express.Router();
const { getProfile, getEvolution, updateProfile, initProfile } = require('../controllers/tasteProfileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProfile);
router.get('/evolution', protect, getEvolution);
router.put('/', protect, updateProfile);
router.post('/init', protect, initProfile);

module.exports = router;
