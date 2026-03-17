import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { TokenService } from '../../core/token.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../../generated/prisma/enums';
import { IAuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PasswordService } from '../../core/password.service';

@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    private usersRepository: UsersRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private passwordService: PasswordService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.passwordService.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta inactiva');
    }

    return this.generateTokens({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await this.passwordService.hash(
      registerDto.password,
    );

    const newUser = await this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName || '',
      role: UserRole.USER,
    });

    return this.generateTokens({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    });
  }

  async refreshAccessToken(
    userId: number,
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const storedToken =
      await this.refreshTokenRepository.findByToken(refreshToken);

    if (!storedToken || storedToken.isRevoked) {
      throw new UnauthorizedException('Refresh token inválido o revocado');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta inactiva');
    }

    const accessToken = await this.tokenService.signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      accessToken,
      expiresIn: this.tokenService.getAccessTokenExpiresInSeconds(),
    };
  }

  async logout(userId: number): Promise<{ message: string }> {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
    return { message: 'Logout exitoso' };
  }

  private async generateTokens(user: IAuthenticatedUser) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.tokenService.signAccessToken(payload);

    const refreshToken = await this.tokenService.signRefreshToken(payload);

    const decoded = this.tokenService.decodeToken(refreshToken);
    const expiresAt = new Date((decoded.exp || 0) * 1000);

    await this.refreshTokenRepository.create({
      user: { connect: { id: user.id } },
      token: refreshToken,
      expiresAt,
    });
    return {
      accessToken,
      refreshToken: refreshToken,
      expiresIn: this.tokenService.getAccessTokenExpiresInSeconds(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
