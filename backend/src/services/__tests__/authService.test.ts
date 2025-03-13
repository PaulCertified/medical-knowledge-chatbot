import { jest } from '@jest/globals';
import { User } from '../../types/user';
import authService from '../authService';
import userRepository from '../../repositories/userRepository';
import * as passwordUtils from '../../utils/password';
import * as jwtUtils from '../../utils/jwt';

// Mock dependencies
jest.mock('../../repositories/userRepository');
jest.mock('../../utils/password');
jest.mock('../../utils/jwt');

describe('AuthService', () => {
  const mockUser: User = {
    userId: '123',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockToken = 'mock.jwt.token';

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.register(
        'test@example.com',
        'password123',
        'Test User'
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith('password123');
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      });
      expect(jwtUtils.generateToken).toHaveBeenCalledWith({
        userId: mockUser.userId,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result).toEqual({
        user: {
          userId: mockUser.userId,
          email: mockUser.email,
          name: mockUser.name,
        },
        token: mockToken,
      });
    });

    it('should throw error if user already exists', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.register(
        'test@example.com',
        'password123',
        'Test User'
      )).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtils.verifyPassword as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.login('test@example.com', 'password123');

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(passwordUtils.verifyPassword).toHaveBeenCalledWith(
        'password123',
        mockUser.password
      );
      expect(jwtUtils.generateToken).toHaveBeenCalledWith({
        userId: mockUser.userId,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result).toEqual({
        user: {
          userId: mockUser.userId,
          email: mockUser.email,
          name: mockUser.name,
        },
        token: mockToken,
      });
    });

    it('should throw error if user not found', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login('test@example.com', 'password123'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtils.verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUser', () => {
    it('should return user by ID', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getUser('123');

      expect(userRepository.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual({
        userId: mockUser.userId,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should throw error if user not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(authService.getUser('123')).rejects.toThrow('User not found');
    });
  });
}); 