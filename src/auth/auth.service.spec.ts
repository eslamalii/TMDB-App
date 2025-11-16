import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';

// Mock user from UserService
const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashedpassword',
} as User;

// Mock UserService
const mockUserService = {
  findByEmail: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn(),
};

// Mock JwtService
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

// Un-mock the real bcrypt.compare
jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'), // Import and retain default behavior
  compare: jest.fn(), // Mock just 'compare'
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

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
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TEST 1: validateUser
  describe('validateUser', () => {
    it('should return user if password is valid', async () => {
      // Mock that passwords match
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({ id: 1, email: 'test@example.com' }); // Should not return hash
      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword',
      );
    });

    it('should return null if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'wrong@email.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      // Mock that passwords do NOT match
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  // TEST 2: login
  describe('login', () => {
    it('should return a JWT token', async () => {
      const user = { id: 1, email: 'test@example.com' };
      const result = await service.login(user as User);

      expect(result).toEqual({ access_token: 'mock.jwt.token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@example.com',
      });
    });
  });
});
