import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env['ALLOWED_ORIGIN'] || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger
  if (process.env['SWAGGER_ENABLED'] === 'true') {
    const config = new DocumentBuilder()
      .setTitle('QR Code API')
      .setDescription('API para gestión de códigos QR con autenticación JWT')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu JWT token aquí',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Endpoints de autenticación')
      .addTag('Users', 'Endpoints de usuarios')
      .addTag('Health', 'Health check')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
      },
    });
  }

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${process.env.PORT ?? 3000}`);
    if (process.env['SWAGGER_ENABLED'] === 'true') {
      console.log(`📚 Swagger en http://localhost:${process.env.PORT ?? 3000}/api/docs`);
    }
  });
}
bootstrap();
