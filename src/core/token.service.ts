import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';
import { TokenType } from 'src/common/enums/token-type.enum';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  private secret: Uint8Array;
  private readonly algorithm = 'HS256';

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
        this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m',
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
        this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d',
      )
      .sign(this.secret);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const { payload } = await jose.jwtVerify(token, this.secret);
      return payload as unknown as JwtPayload;
    } catch (error: any) {
      throw new Error('Token inválido o expirado');
    }
  }

  // solo para debugging
  decodeToken(token: string): JwtPayload {
    return jose.decodeJwt(token) as unknown as JwtPayload;
  }
}
