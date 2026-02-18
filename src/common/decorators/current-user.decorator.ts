import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthenticatedRequest } from '../interfaces/authenticated-request.interface';
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuthenticatedRequest['user'] => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
