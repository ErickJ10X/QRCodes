import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../users/repositories/users.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { TokenService } from 'src/core/token.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { IAuthenticatedUser } from 'src/common/interfaces/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    private usersRepository: UsersRepository,
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
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

    const saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '10', 10);
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

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
      expiresIn: this.parseExpiresIn(
        process.env['JWT_ACCESS_TOKEN_EXPIRES_IN'] || '15m',
      ),
    };
  }

  async logout(refreshTokenId: number): Promise<{ message: string }> {
    await this.refreshTokenRepository.revoke(refreshTokenId);
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
      expiresIn: this.parseExpiresIn(
        process.env['JWT_ACCESS_TOKEN_EXPIRES_IN'] || '15m',
      ),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900;

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    const unitToSeconds: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return num * (unitToSeconds[unit] || 60);
  }
}
