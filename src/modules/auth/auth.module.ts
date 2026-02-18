import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { TokenService } from 'src/core/token.service';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { JwtRefreshStrategy } from 'src/common/strategies/jwt-refresh.strategy';
import { PasswordService } from 'src/core/password.service';

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
  exports: [UsersModule],
})
export class AuthModule {}
