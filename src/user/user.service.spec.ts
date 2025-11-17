import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

// Mock the User entity
const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedpassword',
} as User;

// Mock the TypeORM Repository
const mockUserRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let repository: typeof mockUserRepository;

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
    repository = mockUserRepository;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find and return a user by email', async () => {
      const email = 'test@example.com';
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail(email);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null if user not found', async () => {
      const email = 'notFound@example.com';
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('create', () => {
    it('should hash the password and create a new user', async () => {
      const dto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'plainpassword',
      };

      const hashedPassword = 'hashedpassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const createdUser = {
        id: 2,
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      };

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(dto);

      expect(result).toEqual(createdUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10);
      expect(repository.create).toHaveBeenCalledWith({
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });
});
