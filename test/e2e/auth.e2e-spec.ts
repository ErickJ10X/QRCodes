import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/core/prisma.service';
import { DatabaseHelper } from '../helpers/database.helper';
import { UserFactory } from '../factories/user.factory';
import { setupTestApp, testAssertions } from '../helpers/test-assertions';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let dbHelper: DatabaseHelper;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = setupTestApp(moduleFixture.createNestApplication());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    dbHelper = new DatabaseHelper(prisma);
  });

  beforeEach(async () => {
    await dbHelper.clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const createUserDto = UserFactory.createRegisterDto();

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto)
        .expect(201);

      testAssertions.expectAuthResponseWithRefresh(response.body);
      const payload = testAssertions.unwrapResponse(response.body);
      expect(payload.user.email).toBe(createUserDto.email);
    });

    it('should reject invalid email format', async () => {
      const invalidDto = UserFactory.createRegisterDto({
        email: 'invalid-email',
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidDto)
        .expect(400);

      testAssertions.expectErrorResponse(response.body);
    });

    it('should reject duplicate email', async () => {
      const createUserDto = UserFactory.createRegisterDto();

      // Primera registración
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto)
        .expect(201);

      // Segunda con mismo email
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto)
        .expect(409);

      testAssertions.expectErrorResponse(response.body);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const createUserDto = UserFactory.createRegisterDto();

      // Registrar usuario
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto);

      // Login
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: createUserDto.email,
          password: createUserDto.password,
        })
        .expect(200);

      testAssertions.expectAuthResponseWithRefresh(response.body);
      const payload = testAssertions.unwrapResponse(response.body);
      expect(payload.accessToken).toBeDefined();
      expect(payload.refreshToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!@#',
        })
        .expect(401);

      testAssertions.expectErrorResponse(response.body);
    });

    it('should reject invalid password', async () => {
      const createUserDto = UserFactory.createRegisterDto();

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: createUserDto.email,
          password: 'WrongPassword123!@#',
        })
        .expect(401);

      testAssertions.expectErrorResponse(response.body);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const createUserDto = UserFactory.createRegisterDto();

      // Registrar y obtener tokens
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto)
        .expect(201);

      const registerPayload = testAssertions.unwrapResponse(
        registerResponse.body,
      );
      const refreshToken = registerPayload.refreshToken;

      // Usar refresh token
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      const payload = testAssertions.unwrapResponse(response.body);
      expect(payload).toHaveProperty('accessToken');
      expect(payload).toHaveProperty('expiresIn');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      testAssertions.expectErrorResponse(response.body);
    });
  });
});
