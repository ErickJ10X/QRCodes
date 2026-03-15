import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    const message = this.resolveMessage(exceptionResponse, exception);

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error =
        exception instanceof Error ? exception.name : 'UnknownError';
    }

    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status}`,
      {
        message,
        stack:
          process.env.NODE_ENV === 'development' && exception instanceof Error
            ? exception.stack
            : undefined,
      },
    );
    response.status(status).json(errorResponse);
  }

  private resolveMessage(
    exceptionResponse: unknown,
    exception: unknown,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const asRecord = exceptionResponse as Record<string, unknown>;
      const message = asRecord.message;

      if (Array.isArray(message) || typeof message === 'string') {
        return message;
      }

      if (typeof asRecord.error === 'string') {
        return asRecord.error;
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }
}
