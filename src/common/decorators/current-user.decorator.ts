import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestUser } from '../interfaces/request-user.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IRequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
