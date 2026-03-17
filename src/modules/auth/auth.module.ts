import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@modules/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { TokenService } from '@core/token.service';
import { JwtStrategy } from '@strategies/jwt.strategy';
import { JwtRefreshStrategy } from '@strategies/jwt-refresh.strategy';
import { PasswordService } from '@core/password.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenRepository,
    TokenService,
    JwtStrategy,
    JwtRefreshStrategy,
    PasswordService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
