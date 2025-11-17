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
    it('should return a user if found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'plainpassword',
    };

    it('should hash the password and create a user', async () => {
      const hashedPassword = 'hashedpassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const createdUser = { ...mockUser, password: hashedPassword };
      repository.create.mockReturnValue(createdUser);
      repository.save.mockResolvedValue(createdUser);

      const result = await service.create(createDto);

      expect(result).toEqual(createdUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        password: hashedPassword,
      });
      expect(repository.save).toHaveBeenCalledWith(createdUser);
    });

    it('should propagate hash errors', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('hash-fail'));

      await expect(service.create(createDto)).rejects.toThrow('hash-fail');
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should propagate save errors', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const entity = { ...mockUser, password: 'hashed' };
      repository.create.mockReturnValue(entity);
      repository.save.mockRejectedValue(new Error('save-fail'));

      await expect(service.create(createDto)).rejects.toThrow('save-fail');
    });
  });
});
