import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      map((data) => {
        const isArray = Array.isArray(data);
        const statusCode = context.switchToHttp().getResponse().statusCode;

        let message = 'Success';
        if (statusCode === 201) message = 'Created successfully';
        else if (statusCode === 204) message = 'Deleted successfully';
        else if (isArray) message = `Found ${data.length} record(s)`;

        return {
          success: true,
          message,
          data,
          timestamp: new Date().toISOString(),
          path,
        } as ApiResponse;
      }),
    );
  }
}
