import { Request } from 'express';
import { UserRole } from '../enums/user-role.enum';

export interface IAuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}
