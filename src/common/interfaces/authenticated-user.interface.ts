import { UserRole } from '../enums/user-role.enum';

export interface IAuthenticatedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
