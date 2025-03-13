import { User, UserSession } from '../types/user';
import { userRepository } from '../repositories/userRepository';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import logger from '../utils/logger';

class AuthService {
  async register(email: string, password: string, name: string): Promise<{ user: UserSession; token: string }> {
    try {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await hashPassword(password);
      const user = await userRepository.create({
        email,
        password: hashedPassword,
        name,
      });

      const userSession: UserSession = {
        userId: user.userId,
        email: user.email,
        name: user.name,
      };

      const token = generateToken(userSession);

      return {
        user: userSession,
        token,
      };
    } catch (error) {
      logger.error('Failed to register user:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: UserSession; token: string }> {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const userSession: UserSession = {
        userId: user.userId,
        email: user.email,
        name: user.name,
      };

      const token = generateToken(userSession);

      return {
        user: userSession,
        token,
      };
    } catch (error) {
      logger.error('Failed to login user:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<UserSession> {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        userId: user.userId,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      logger.error('Failed to get user:', error);
      throw error;
    }
  }
}

const authService = new AuthService();
export type { AuthService };
export default authService; 