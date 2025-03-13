import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

export const validateSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

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