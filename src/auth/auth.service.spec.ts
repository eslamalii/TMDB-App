import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { ConflictException } from '@nestjs/common';

jest.mock('bcrypt');

// Mock user from UserService
const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashedpassword',
  username: 'testuser',
} as User;

// Mock UserService
const mockUserService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

// Mock JwtService
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: typeof mockUserService;
  let jwtService: typeof mockJwtService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = mockUserService;
    jwtService = mockJwtService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if password is valid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      // Mock that passwords match
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      });

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword',
      );
    });

    it('should return null if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'wrong@example.com',
        'password123',
      );

      expect(result).toBeNull();
      expect(userService.findByEmail).toHaveBeenCalledWith('wrong@example.com');
    });

    it('should return null if password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedpassword',
      );
    });
  });

  describe('register', () => {
    it('should create a new user if email is not taken', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockUser);

      const dto = {
        email: 'NEW@EXAMPLE.COM ',
        username: 'newuser',
        password: 'password123',
      };

      const result = await service.register(dto);

      expect(result).toEqual(mockUser);
      expect(userService.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(userService.create).toHaveBeenCalledWith({
        ...dto,
        email: 'new@example.com',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const dto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const result = await service.login(mockUser);

      expect(result).toEqual({ access_token: 'mock.jwt.token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });
});
