import { Expose } from 'class-transformer';
import { UserRole } from '../../../common/enums/user-role.enum';

export class AuthResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  expiresIn: number;

  @Expose()
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName?: string;
    role: UserRole;
  };
}
