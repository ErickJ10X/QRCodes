import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { JwtGuard } from '../../common/guards/jwt.guard';
import type { IAuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @ApiOperation({ summary: 'Inicia sesión con email y contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso, retorna tokens JWT',
    example: {
      success: true,
      message: 'Success',
      data: {
        accessToken: 'eyJhbGc...',
        refreshToken: 'eyJhbGc...',
        expiresIn: 900,
        user: { id: 1, email: 'user@example.com', role: 'USER' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos de login' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @ApiOperation({ summary: 'Registra un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
  })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos de registro' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Genera un nuevo access token' })
  @ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido/expirado' })
  async refresh(@Req() req: IAuthenticatedRequest) {
    const userId = req.user.id;
    const { refreshToken } = req.body;
    return this.authService.refreshAccessToken(userId, refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cierra la sesión actual' })
  @ApiResponse({ status: 200, description: 'Logout exitoso' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async logout(@Req() req: IAuthenticatedRequest) {
    const userId = req.user.id;
    return this.authService.logout(userId);
  }
}
