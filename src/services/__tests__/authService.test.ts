import { jest } from '@jest/globals';
import { AuthService } from '../authService';
import { User } from '../../types/user';
import userRepository from '../../repositories/userRepository';
import * as passwordUtils from '../../utils/password';
import * as jwtUtils from '../../utils/jwt';
import authService from '../../services/authService';

// Mock dependencies
jest.mock('../../repositories/userRepository');
jest.mock('../../utils/password');
jest.mock('../../utils/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('token');

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      expect(result).toEqual({
        user: mockUser,
        token: 'token'
      });
    });

    it('should throw error if user already exists', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtils.verifyPassword as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('token');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result).toEqual({
        user: mockUser,
        token: 'token'
      });
    });

    it('should throw error if user not found', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login({
        email: 'test@example.com',
        password: 'password123'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtils.verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login({
        email: 'test@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUser', () => {
    it('should return user by id', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getUser('123');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(authService.getUser('123')).rejects.toThrow('User not found');
    });
  });
}); 