import { Request } from 'express';
import { UserRole } from '../../generated/prisma/enums';

export interface IAuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}
