import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

export function setupTestApp(app: INestApplication) {
  // Aplicar los mismos pipes/filters que en main.ts
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
