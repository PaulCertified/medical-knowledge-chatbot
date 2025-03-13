const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window per IP
  message: 'Too many authentication attempts. Please try again later.'
});

// Registration routes
router.post('/register', authController.register);
router.post('/confirm', authController.confirmRegistration);
router.post('/resend-confirmation', authController.resendConfirmationCode);

// Login route with rate limiting
router.post('/login', authLimiter, authController.login);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router; 