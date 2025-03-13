const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// Input validation middleware
const validateSignUpInput = (req, res, next) => {
  const { username, password, email } = req.body;
  
  if (!username || !password || !email) {
    return res.status(400).json({
      error: 'Missing required fields'
    });
  }

  // Password strength validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }

  next();
};

// Sign up
router.post('/signup', validateSignUpInput, async (req, res) => {
  try {
    const { username, password, email, attributes } = req.body;
    const result = await authService.signUp(username, password, email, attributes);
    res.status(201).json(result);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Confirm sign up
router.post('/confirm-signup', async (req, res) => {
  try {
    const { username, confirmationCode } = req.body;
    
    if (!username || !confirmationCode) {
      return res.status(400).json({
        error: 'Username and confirmation code are required'
      });
    }

    const result = await authService.confirmSignUp(username, confirmationCode);
    res.json(result);
  } catch (error) {
    console.error('Confirm signup error:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Sign in
router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    const result = await authService.signIn(username, password);
    
    // Set secure HTTP-only cookie with the refresh token
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Extract user info from ID token
    const userInfo = authService.extractUserInfo(result.tokens.idToken);

    res.json({
      accessToken: result.tokens.accessToken,
      idToken: result.tokens.idToken,
      user: userInfo
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(401).json({
      error: 'Invalid credentials'
    });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({
        error: 'Username is required'
      });
    }

    const result = await authService.forgotPassword(username);
    res.json(result);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Confirm forgot password
router.post('/confirm-forgot-password', async (req, res) => {
  try {
    const { username, confirmationCode, newPassword } = req.body;
    
    if (!username || !confirmationCode || !newPassword) {
      return res.status(400).json({
        error: 'Username, confirmation code, and new password are required'
      });
    }

    const result = await authService.confirmForgotPassword(
      username,
      confirmationCode,
      newPassword
    );
    res.json(result);
  } catch (error) {
    console.error('Confirm forgot password error:', error);
    res.status(400).json({
      error: error.message
    });
  }
});

// Verify token (for protected routes)
router.post('/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const result = await authService.verifyToken(token);
    
    if (!result.valid) {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    res.json({
      valid: true,
      user: result.decoded
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      error: 'Invalid token'
    });
  }
});

module.exports = router; 