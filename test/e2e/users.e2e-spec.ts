import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/core/prisma.service';
import { DatabaseHelper } from '../helpers/database.helper';
import { UserFactory } from '../factories/user.factory';
import { testAssertions } from '../helpers/test-assertions';

describe('Users Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let dbHelper: DatabaseHelper;
  let accessToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    dbHelper = new DatabaseHelper(prisma);
  });

  beforeEach(async () => {
    await dbHelper.clearDatabase();

    // Registrar usuario y obtener token
    const createUserDto = UserFactory.create();
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(createUserDto);

    const registerPayload = testAssertions.unwrapResponse(registerResponse.body);
    accessToken = registerPayload.accessToken;
    userId = registerPayload.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users/:id', () => {
    it('should return current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      testAssertions.expectUserResponse(response.body);
      const payload = testAssertions.unwrapResponse(response.body);
      expect(payload.id).toBe(userId);
    });

    it('should reject request without token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .expect(401);

      testAssertions.expectErrorResponse(response.body);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      testAssertions.expectErrorResponse(response.body);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user profile', async () => {
      const updateDto = { firstName: 'Jane' };

      const response = await request(app.getHttpServer())
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);

      testAssertions.expectUserResponse(response.body);
      const payload = testAssertions.unwrapResponse(response.body);
      expect(payload.firstName).toBe('Jane');
    });

    it('should reject update of other user', async () => {
      const otherUserId = userId + 1;

      await request(app.getHttpServer())
        .patch(`/api/users/${otherUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ firstName: 'Hacker' })
        .expect(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user account', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      testAssertions.expectUserResponse(response.body);

      // Verificar que no puede login después de delete
      await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
