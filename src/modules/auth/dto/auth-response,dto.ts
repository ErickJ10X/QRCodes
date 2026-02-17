import { Expose } from 'class-transformer';
import { UserRole } from 'src/common/enums/user-role.enum';

export class AuthResponseDto {
  @Expose()
  accesToken: string;

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
