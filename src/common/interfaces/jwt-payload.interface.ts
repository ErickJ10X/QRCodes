import { TokenType } from '../enums/token-type.enum';
import { UserRole } from '../enums/user-role.enum';

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
  type?: TokenType;
}
