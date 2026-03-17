import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import * as jose from 'jose';
import { JwtPayload } from '@interfaces/jwt-payload.interface';
import { TokenType } from '@enums/token-type.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(CustomStrategy, 'jwt') {
  private secret: Uint8Array;

  constructor(private configService: ConfigService) {
    super();

    const secretString = this.configService.get<string>('JWT_SECRET');
    if (!secretString) {
      throw new Error('JWT_SECRET variable de entorno no definida');
    }
    this.secret = new TextEncoder().encode(secretString);
  }

  async validate(req: any): Promise<any> {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new UnauthorizedException(
        'Token de autenticación no proporcionado',
      );
    }

    try {
      const { payload } = await jose.jwtVerify(token, this.secret);
      const jwtPayload = payload as unknown as JwtPayload;

      if (jwtPayload.type !== TokenType.ACCESS) {
        throw new UnauthorizedException('Tipo de token no válido');
      }

      return {
        id: jwtPayload.id,
        email: jwtPayload.email,
        role: jwtPayload.role,
      };
    } catch (error: any) {
      if (error.message.includes('Token is expired')) {
        throw new UnauthorizedException('Token de autenticación expirado');
      }
      throw new UnauthorizedException('Token de autenticación no válido');
    }
  }
}
