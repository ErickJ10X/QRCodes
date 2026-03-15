import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';
import { UsersRepository } from '../../../src/modules/users/repositories/users.repository';
import { RefreshTokenRepository } from '../../../src/modules/auth/repositories/refresh-token.repository';
import { TokenService } from '../../../src/core/token.service';
import { PasswordService } from '../../../src/core/password.service';
import { UserRole } from '../../../src/generated/prisma/enums';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    const mockUsersRepository = {
      findByEmailWithPassword: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const mockRefreshTokenRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };

    const mockTokenService = {
      signAccessToken: jest.fn().mockResolvedValue('access-token'),
      signRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
      decodeToken: jest.fn().mockReturnValue({ exp: 9999999999 }),
    };

    const mockPasswordService = {
      compare: jest.fn(),
      hash: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        {
          provide: RefreshTokenRepository,
          useValue: mockRefreshTokenRepository,
        },
        { provide: TokenService, useValue: mockTokenService },
        { provide: PasswordService, useValue: mockPasswordService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(
      UsersRepository,
    ) as jest.Mocked<UsersRepository>;
    refreshTokenRepository = module.get(
      RefreshTokenRepository,
    ) as jest.Mocked<RefreshTokenRepository>;
    tokenService = module.get(TokenService) as jest.Mocked<TokenService>;
    passwordService = module.get(
      PasswordService,
    ) as jest.Mocked<PasswordService>;
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!@#',
      };

      const mockUser = {
        id: 1,
        email: loginDto.email,
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: '$2a$10$hashedpassword',
      };

      usersRepository.findByEmailWithPassword.mockResolvedValue(mockUser as any);
      passwordService.compare.mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(usersRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(passwordService.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(tokenService.signAccessToken).toHaveBeenCalled();
      expect(tokenService.signRefreshToken).toHaveBeenCalled();
      expect(refreshTokenRepository.create).toHaveBeenCalled();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!@#',
      };
      usersRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
