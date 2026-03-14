import { UserRole } from '../../generated/prisma/enums';

export interface IAuthenticatedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
