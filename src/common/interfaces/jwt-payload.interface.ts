import { TokenType } from '../enums/token-type.enum';
import { UserRole } from '../../generated/prisma/enums';

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
  type?: TokenType;
}
