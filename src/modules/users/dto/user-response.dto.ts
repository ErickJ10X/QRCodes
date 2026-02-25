import { Expose } from 'class-transformer';
import { UserRole } from '../../../common/enums/user-role.enum';
export class UserResponseDto {
  @Expose()
  id: number;
  @Expose()
  email: string;
  @Expose()
  firstName: string;
  @Expose()
  lastName?: string;
  @Expose()
  role?: UserRole;
  @Expose()
  isActive: boolean;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
