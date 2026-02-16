import { UserRole } from '../enums/user-role.enum';

export interface IRequestUser {
  id: number;
  email: string;
  role: UserRole;
}
