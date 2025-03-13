import jwt from 'jsonwebtoken';
import env from '../config/env';
import { UserSession } from '../types/user';

export function generateToken(user: UserSession): string {
  const secret = Buffer.from(env.JWT_SECRET, 'utf8');
  return jwt.sign(user, secret, {
    expiresIn: '24h',
  });
}

export function verifyToken(token: string): UserSession {
  const secret = Buffer.from(env.JWT_SECRET, 'utf8');
  return jwt.verify(token, secret) as UserSession;
} 