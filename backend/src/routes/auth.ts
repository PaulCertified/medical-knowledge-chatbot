import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { authLimiter } from '../middleware/rateLimiter';
import { validateSession } from '../middleware/auth';

const router = Router();
const dynamoDB = new DynamoDB.DocumentClient();

// Validation middleware
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
];

const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').optional().trim().isLength({ min: 2 }),
];

// Session validation endpoint
router.get('/session', validateSession, async (req, res) => {
  try {
    const { userId } = req.user!;

    const result = await dynamoDB.get({
      TableName: 'user_data',
      Key: { id: userId },
    }).promise();

    if (!result.Item) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...user } = result.Item;
    res.json({ user });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', authLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const result = await dynamoDB.query({
      TableName: 'user_data',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    }).promise();

    const user = result.Items?.[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { password: _, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Signup endpoint
router.post('/signup', authLimiter, signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if email already exists
    const existingUser = await dynamoDB.query({
      TableName: 'user_data',
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    }).promise();

    if (existingUser.Items?.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const userId = uuidv4();
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      name: name || null,
      createdAt: new Date().toISOString(),
    };

    await dynamoDB.put({
      TableName: 'user_data',
      Item: newUser,
    }).promise();

    // Generate JWT token
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { password: _, ...userData } = newUser;
    res.status(201).json({ user: userData });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
});

export default router; 