import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/modules/users/users.service';
import { UsersRepository } from '../../../src/modules/users/repositories/users.repository';
import { PasswordService } from '../../../src/core/password.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserFactory } from '../../factories/user.factory';
import { UserRole } from '../../../src/generated/prisma/enums';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    };
    const mockPasswordService = {
      hash: jest.fn().mockResolvedValue('hashedPassword123'),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
        { provide: PasswordService, useValue: mockPasswordService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository) as jest.Mocked<UsersRepository>;
    passwordService = module.get(
      PasswordService,
    ) as jest.Mocked<PasswordService>;
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = UserFactory.create();
      const expectedUser = {
        id: 1,
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName ?? '',
        role: createUserDto.role ?? UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(passwordService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(repository.create).toHaveBeenCalled();
      expect(result.email).toBe(createUserDto.email);
      expect(result).toMatchObject({ email: createUserDto.email });
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = UserFactory.create();
      const existingUser = { id: 1, ...createUserDto };

      repository.findByEmail.mockResolvedValue(existingUser as any);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findById.mockResolvedValue(mockUser as any);

      const result = await service.findOne(userId);

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(result.id).toBe(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        UserFactory.create() as any,
        UserFactory.create() as any,
      ];

      repository.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(repository.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const userId = 1;
      const updateUserDto = { firstName: 'Jane' };
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.update.mockResolvedValue(updatedUser as any);

      const result = await service.update(userId, updateUserDto as any, userId);

      expect(repository.update).toHaveBeenCalled();
      expect(result.firstName).toBe('Jane');
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      const userId = 1;
      const deletedUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.delete.mockResolvedValue(deletedUser as any);

      const result = await service.remove(userId, userId);

      expect(repository.delete).toHaveBeenCalledWith(userId);
      expect(result.id).toBe(userId);
    });
  });
});
