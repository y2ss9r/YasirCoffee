const express = require('express');
const router = express.Router();
const {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const schemas = require('../middleware/schemas');

router.post('/', validate(schemas.registerUser), registerUser);
router.post('/login', validate(schemas.loginUser), authUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, validate(schemas.updateUser), updateUserProfile);

module.exports = router;

