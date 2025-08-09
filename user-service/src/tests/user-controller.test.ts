import { Request, Response } from 'express';
import { registerUser, loginUser } from '@userService/controllers/userController';
import User from '@userService/models/User';
import jwt from 'jsonwebtoken';

// Mock the User model
jest.mock('@userService/models/User');
jest.mock('jsonwebtoken');

const MockedUser = User as jest.Mocked<typeof User>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('userController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockRequest = {};

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a user successfully and return 201 with user data and token', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
        user_pwd: 'password123',
      };

      const mockUser = {
        uuid: 'mock-uuid-123',
        user_email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true),
      };

      MockedUser.findOne.mockResolvedValue(null); // User doesn't exist
      MockedUser.prototype.save = jest.fn().mockResolvedValue(true);
      
      // Mock User constructor
      (MockedUser as any).mockImplementation(() => mockUser);

      // Mock JWT sign
      mockedJwt.sign.mockImplementation((payload, secret, options, callback: any) => {
        callback(null, 'mock-jwt-token');
      });

      // Act
      await registerUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(MockedUser.findOne).toHaveBeenCalledWith({ user_email: 'test@example.com' });
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User registered successfully!',
        user: {
          uuid: 'mock-uuid-123',
          user_email: 'test@example.com'
        },
        token: 'mock-jwt-token'
      });
    });

    it('should return 400 if email is missing', async () => {
      // Arrange
      mockRequest.body = {
        user_pwd: 'password123',
      };

      // Act
      await registerUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Please enter all fields (email and password)'
      });
    });

    it('should return 400 if password is missing', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
      };

      // Act
      await registerUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Please enter all fields (email and password)'
      });
    });

    it('should return 400 for invalid email format', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'invalid-email',
        user_pwd: 'password123',
      };

      // Act
      await registerUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Please enter a valid email address'
      });
    });

    it('should return 400 if password is less than 6 characters', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
        user_pwd: '123',
      };

      // Act
      await registerUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Password must be at least 6 characters long'
      });
    });

    it('should return 409 if user already exists', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
        user_pwd: 'password123',
      };

      MockedUser.findOne.mockResolvedValue({
        uuid: 'existing-user-uuid',
        user_email: 'test@example.com',
      } as any);

      // Act
      await registerUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User with that email already exists'
      });
    });

    it('should return 500 if database save fails', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
        user_pwd: 'password123',
      };

      MockedUser.findOne.mockResolvedValue(null);
      
      const mockUser = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (MockedUser as any).mockImplementation(() => mockUser);

      // Act
      await registerUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Server error during registration'
      });
    });

    it('should return 400 for validation error', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
        user_pwd: 'password123',
      };

      MockedUser.findOne.mockResolvedValue(null);
      
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      
      const mockUser = {
        save: jest.fn().mockRejectedValue(validationError),
      };
      (MockedUser as any).mockImplementation(() => mockUser);

      // Act
      await registerUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Validation failed'
      });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully and return token', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
        user_pwd: 'password123',
      };

      const mockUser = {
        uuid: 'mock-uuid-123',
        user_email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      MockedUser.findOne.mockResolvedValue(mockUser as any);

      // Mock JWT sign
      mockedJwt.sign.mockImplementation((payload, secret, options, callback: any) => {
        callback(null, 'mock-jwt-token');
      });

      // Act
      await loginUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(MockedUser.findOne).toHaveBeenCalledWith({ user_email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Login successful! Welcome back!',
        token: 'mock-jwt-token'
      });
    });

    it('should return 400 if email is missing', async () => {
      // Arrange
      mockRequest.body = {
        user_pwd: 'password123',
      };

      // Act
      await loginUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Please enter all fields (email and password)'
      });
    });

    it('should return 400 if password is missing', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
      };

      // Act
      await loginUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Please enter all fields (email and password)'
      });
    });

    it('should return 401 if user does not exist', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'nonexistent@example.com',
        user_pwd: 'password123',
      };

      MockedUser.findOne.mockResolvedValue(null);

      // Act
      await loginUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 401 for invalid password', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
        user_pwd: 'wrongpassword',
      };

      const mockUser = {
        uuid: 'mock-uuid-123',
        user_email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      MockedUser.findOne.mockResolvedValue(mockUser as any);

      // Act
      await loginUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 500 if database query fails', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
        user_pwd: 'password123',
      };

      MockedUser.findOne.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await loginUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Server error during login'
      });
    });

    it('should return 500 if JWT signing fails', async () => {
      // Arrange
      mockRequest.body = {
        user_email: 'test@example.com',
        user_pwd: 'password123',
      };

      const mockUser = {
        uuid: 'mock-uuid-123',
        user_email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      MockedUser.findOne.mockResolvedValue(mockUser as any);

      // Mock console.error to avoid noise in test output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock JWT sign to fail
      mockedJwt.sign.mockImplementation((payload, secret, options, callback: any) => {
        // Call the callback immediately with an error
        callback(new Error('JWT signing failed'), null);
        return; // Return to prevent further execution
      });

      // Act
      await loginUser(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('JWT signing error:', 'JWT signing failed');
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Server error during login'
      });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});