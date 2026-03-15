import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  constructor(private configService: ConfigService) {}

  async hash(password: string): Promise<string> {
    const configuredRounds = this.configService.get<string | number>(
      'BCRYPT_SALT_ROUNDS',
      10,
    );
    const saltRounds =
      typeof configuredRounds === 'number'
        ? configuredRounds
        : Number.parseInt(configuredRounds, 10);

    const safeSaltRounds = Number.isFinite(saltRounds) && saltRounds > 0
      ? saltRounds
      : 10;

    return bcrypt.hash(password, safeSaltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
