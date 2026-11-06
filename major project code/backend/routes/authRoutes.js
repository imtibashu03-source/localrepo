const express = require('express');
const router = express.Router();
const { register, login, getMe, registerValidators, loginValidators } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post('/register', authLimiter, registerValidators, register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidators, login);

// GET /api/auth/me
router.get('/me', auth, getMe);

module.exports = router;
