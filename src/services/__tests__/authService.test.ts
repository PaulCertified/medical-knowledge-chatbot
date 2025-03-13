import { AuthService } from '../authService';
import { UserRepository } from '../../repositories/userRepository';
import { User } from '../../types/user';
import { generateToken, verifyToken } from '../../utils/jwt';
import { hashPassword, comparePasswords } from '../../utils/password';

// Mock dependencies
jest.mock('../../repositories/userRepository');
jest.mock('../../utils/jwt');
jest.mock('../../utils/password');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock repository
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
    } as jest.Mocked<UserRepository>;

    // Initialize service with mock repository
    authService = new AuthService(mockUserRepository);

    // Setup default mock implementations
    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (comparePasswords as jest.Mock).mockResolvedValue(true);
    (generateToken as jest.Mock).mockReturnValue('mock-token');
    (verifyToken as jest.Mock).mockReturnValue({ userId: mockUser.id });
  });

  describe('signup', () => {
    it('should create a new user and return token', async () => {
      // Setup
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Execute
      const result = await authService.signup({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      // Verify
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
        token: 'mock-token',
      });
    });

    it('should throw error if email already exists', async () => {
      // Setup
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Execute & Verify
      await expect(authService.signup({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return user and token on successful login', async () => {
      // Setup
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Execute
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Verify
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(comparePasswords).toHaveBeenCalledWith('password123', mockUser.password);
      expect(generateToken).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
        token: 'mock-token',
      });
    });

    it('should throw error if user not found', async () => {
      // Setup
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Execute & Verify
      await expect(authService.login({
        email: 'test@example.com',
        password: 'password123',
      })).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      // Setup
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      // Execute & Verify
      await expect(authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('validateSession', () => {
    it('should return user if token is valid', async () => {
      // Setup
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Execute
      const result = await authService.validateSession('mock-token');

      // Verify
      expect(verifyToken).toHaveBeenCalledWith('mock-token');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should throw error if token is invalid', async () => {
      // Setup
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Execute & Verify
      await expect(authService.validateSession('invalid-token'))
        .rejects.toThrow('Invalid token');
    });

    it('should throw error if user not found', async () => {
      // Setup
      mockUserRepository.findById.mockResolvedValue(null);

      // Execute & Verify
      await expect(authService.validateSession('mock-token'))
        .rejects.toThrow('User not found');
    });
  });
}); 