import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // ============================================================================
  // LOGGING: nestjs-pino
  // ============================================================================
  app.useLogger(app.get(Logger));

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // ============================================================================
  // SEGURIDAD: Helmet - Headers de seguridad
  // ============================================================================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // ============================================================================
  // CORS: Control de origen cruzado
  // ============================================================================
  const allowedOrigins = (
    process.env.CORS_ORIGIN || 'http://localhost:3001,http://localhost:3000'
  ).split(',');

  app.enableCors({
    origin: allowedOrigins.map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
  });

  // ============================================================================
  // VALIDACIÓN GLOBAL: class-validator pipes (mejorado)
  // ============================================================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
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

  // ============================================================================
  // EXCEPCIÓN GLOBAL: HttpExceptionFilter
  // ============================================================================
  app.useGlobalFilters(new HttpExceptionFilter());

  // ============================================================================
  // SWAGGER DOCUMENTATION
  // ============================================================================
  const config = new DocumentBuilder()
    .setTitle('QR Code Generator API')
    .setDescription('API para generación y análisis de códigos QR')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addServer(`http://localhost:${process.env.PORT || 3000}`, 'Local')
    .addServer('https://api.example.com', 'Production')
    .addTag('Auth', 'Endpoints de autenticación')
    .addTag('Users', 'Endpoints de gestión de usuarios')
    .addTag('QR-Codes', 'Endpoints de gestión de códigos QR')
    .addTag('Analytics', 'Endpoints de estadísticas')
    .addTag('Health', 'Health check del servidor')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
  });

  // ============================================================================
  // INICIAR SERVIDOR
  // ============================================================================
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(
    `✅ Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  console.log(`📚 Swagger available at: http://localhost:${port}/${globalPrefix}/docs`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
