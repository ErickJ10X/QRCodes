import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';
import { TokenType } from '../common/enums/token-type.enum';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  private secret: Uint8Array;
  private readonly algorithm = 'HS256';
  private readonly defaultAccessTokenExpiry = '15m';
  private readonly defaultRefreshTokenExpiry = '7d';

  constructor(private configService: ConfigService) {
    const secretString = this.configService.get<string>('JWT_SECRET');
    if (!secretString) {
      throw new Error('JWT_SECRET variable de entorno no definida');
    }
    this.secret = new TextEncoder().encode(secretString);
  }

  async signAccessToken(
    payload: Omit<JwtPayload, 'iat' | 'exp' | 'type'>,
  ): Promise<string> {
    return new jose.SignJWT({
      ...payload,
      type: TokenType.ACCESS,
    })
      .setProtectedHeader({ alg: this.algorithm })
      .setExpirationTime(
        this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') ||
          this.defaultAccessTokenExpiry,
      )
      .sign(this.secret);
  }

  async signRefreshToken(
    payload: Omit<JwtPayload, 'iat' | 'exp' | 'type'>,
  ): Promise<string> {
    return new jose.SignJWT({
      ...payload,
      type: TokenType.REFRESH,
    })
      .setProtectedHeader({ alg: this.algorithm })
      .setExpirationTime(
        this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') ||
          this.defaultRefreshTokenExpiry,
      )
      .sign(this.secret);
  }

  getAccessTokenExpiresInSeconds(): number {
    const configured =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') ||
      this.defaultAccessTokenExpiry;
    return this.parseExpiresIn(configured);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const { payload } = await jose.jwtVerify(token, this.secret);
      return payload as unknown as JwtPayload;
    } catch (error: any) {
      if (error.message?.includes('signature verification failed')) {
        throw new Error('Token con firma inválida');
      }
      if (error.message?.includes('Token is expired')) {
        throw new Error('Token expirado');
      }
      throw new Error('Token inválido');
    }
  }

  // solo para debugging
  decodeToken(token: string): JwtPayload {
    return jose.decodeJwt(token) as unknown as JwtPayload;
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
