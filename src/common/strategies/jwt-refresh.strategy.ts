import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import * as jose from 'jose';
import { TokenType } from '../enums/token-type.enum';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  CustomStrategy,
  'jwt-refresh',
) {
  private secret: Uint8Array;

  constructor(private configService: ConfigService) {
    super();

    const secretString = this.configService.get<string>('JWT_SECRET');
    if (!secretString) {
      throw new Error('[JwtRefreshStrategy] JWT_SECRET not configured');
    }
    this.secret = new TextEncoder().encode(secretString);
  }

  async validate(req: any): Promise<any> {
    const token = req.body?.refreshToken;

    if (!token) {
      throw new UnauthorizedException('Refresh token no proporcionado');
    }

    try {
      const { payload } = await jose.jwtVerify(token, this.secret);
      const jwtPayload = payload as unknown as JwtPayload;

      if (jwtPayload.type !== TokenType.REFRESH) {
        throw new UnauthorizedException('Token no es de tipo REFRESH');
      }

      return {
        id: jwtPayload.id,
        email: jwtPayload.email,
        role: jwtPayload.role,
      };
    } catch (error: any) {
      if (error.message.includes('Token is expired')) {
        throw new UnauthorizedException('Refresh token expirado');
      }
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
