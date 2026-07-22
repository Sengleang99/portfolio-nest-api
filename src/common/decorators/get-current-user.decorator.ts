import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: Record<string, unknown>;
}

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext): unknown => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) {
      return null;
    }
    if (!data) {
      return user;
    }
    return user[data];
  },
);
