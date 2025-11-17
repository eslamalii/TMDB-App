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
  password: 'hashedPassword123',
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
    it('should return user without password if credentials are valid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
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
        'hashedPassword123',
      );
    });

    it('should normalize email (trim and lowercase)', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.validateUser('  TEST@Example.com ', 'password123');

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'notfound@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongPassword',
      );

      expect(result).toBeNull();
    });

    it('should propagate bcrypt.compare errors', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('bcrypt-error'),
      );

      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow('bcrypt-error');
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    };

    it('should create a new user and normalize email', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        ...registerDto,
        email: '  NEW@EXAMPLE.COM ',
      });

      expect(result).toEqual(mockUser);
      expect(userService.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(userService.create).toHaveBeenCalledWith({
        ...registerDto,
        email: 'new@example.com',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.create).not.toHaveBeenCalled();
    });

    it('should propagate create errors', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockRejectedValue(new Error('create-fail'));

      await expect(service.register(registerDto)).rejects.toThrow(
        'create-fail',
      );
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
