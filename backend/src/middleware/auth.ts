import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt';
import { UserSession } from '../types/user';

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export const validateSession = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.clearCookie('auth_token');
      return res.status(401).json({ message: 'Session expired' });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.clearCookie('auth_token');
      return res.status(401).json({ message: 'Invalid session' });
    }

    console.error('Session validation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 