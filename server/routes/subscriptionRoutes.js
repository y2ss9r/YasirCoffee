const express = require('express');
const router = express.Router();
const {
    getSubscriptions, create, update, cancel, adjust, suggestions,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSubscriptions);
router.post('/', protect, create);
router.get('/suggestions', protect, suggestions);
router.put('/:id', protect, update);
router.delete('/:id', protect, cancel);
router.post('/:id/adjust', protect, adjust);

module.exports = router;
