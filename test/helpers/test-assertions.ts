import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

let throttlerDisabled = false;

export function setupTestApp(app: INestApplication) {
  // Desactivar rate-limit en e2e para evitar falsos negativos por volumen de pruebas
  if (!throttlerDisabled) {
    ThrottlerGuard.prototype.canActivate = async () => true;
    throttlerDisabled = true;
  }

  // Mantener comportamiento de rutas y validacion alineado con main.ts
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      errorHttpStatusCode: 422,
      stopAtFirstError: false,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((error: ValidationError) => {
          const constraints = Object.values(error.constraints || {});
          return `${error.property}: ${constraints.join(', ')}`;
        });
        return new BadRequestException({
          statusCode: 422,
          message: messages,
          error: 'Validation Failed',
        });
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  return app;
}

export const testAssertions = {
  unwrapResponse: (body: any) => body?.data ?? body,

  /**
   * Validar estructura de error HTTP
   */
  expectErrorResponse: (body: any) => {
    expect(body).toHaveProperty('statusCode');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('path');
    expect(body).toHaveProperty('method');
    expect(body).toHaveProperty('message');
  },

  /**
   * Validar estructura de User DTO
   */
  expectUserResponse: (body: any) => {
    const payload = body?.data ?? body;
    expect(payload).toHaveProperty('id');
    expect(payload).toHaveProperty('email');
    expect(payload).toHaveProperty('firstName');
    expect(payload).toHaveProperty('lastName');
    expect(payload).toHaveProperty('role');
    expect(payload).toHaveProperty('createdAt');
    expect(payload).toHaveProperty('updatedAt');
  },

  /**
   * Validar estructura de QR DTO
   */
  expectQrCodeResponse: (body: any) => {
    const payload = body?.data ?? body;
    expect(payload).toHaveProperty('id');
    expect(payload).toHaveProperty('userId');
    expect(payload).toHaveProperty('targetUrl');
    expect(payload).toHaveProperty('title');
    expect(payload).toHaveProperty('format');
    expect(payload).toHaveProperty('status');
    expect(payload).toHaveProperty('scans');
  },

  /**
   * Validar estructura de Auth Response
   */
  expectAuthResponse: (body: any) => {
    const payload = body?.data ?? body;
    expect(payload).toHaveProperty('accessToken');
    expect(payload).toHaveProperty('user');
    expect(payload.user).toHaveProperty('id');
    expect(payload.user).toHaveProperty('email');
  },

  expectAuthResponseWithRefresh: (body: any) => {
    const payload = body?.data ?? body;
    expect(payload).toHaveProperty('accessToken');
    expect(payload).toHaveProperty('refreshToken');
    expect(payload).toHaveProperty('user');
    expect(payload.user).toHaveProperty('id');
    expect(payload.user).toHaveProperty('email');
  },
};
