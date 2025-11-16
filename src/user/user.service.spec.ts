import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

// Mock the User entity
const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  password_hash: 'hashedpassword',
  created_at: new Date(),
  ratings: [],
  watchlist: [],
};

// Mock the TypeORM Repository
const mockUserRepository = {
  create: jest.fn().mockImplementation((dto) => dto),
  save: jest.fn().mockResolvedValue(mockUser),
  findOne: jest.fn().mockResolvedValue(mockUser),
};

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TEST 1: findByEmail (will fail)
  describe('findByEmail', () => {
    it('should find and return a user by email', async () => {
      const email = 'test@example.com';
      const user = await service.findByEmail(email);

      expect(user).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  // TEST 2: create (will fail)
  describe('create', () => {
    it('should hash the password and create a new user', async () => {
      const dto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'plainpassword', // Plain text password
      };

      const user = await service.create(dto);

      expect(user).toEqual(mockUser);
      // Check that the password was hashed
      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10);
      // Check that the hashed password was saved, not the plain one
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedpassword',
        }),
      );
    });
  });
});
