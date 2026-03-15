import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/core/prisma.service';
import { DatabaseHelper } from '../helpers/database.helper';
import { UserFactory } from '../factories/user.factory';
import { QrCodeFactory } from '../factories/qr-code.factory';
import { testAssertions } from '../helpers/test-assertions';

describe('QR Codes Endpoints (e2e)', () => {
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

  describe('POST /api/qr-codes', () => {
    it('should create a new QR code', async () => {
      const createQrDto = QrCodeFactory.create(userId);

      const response = await request(app.getHttpServer())
        .post('/api/qr-codes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createQrDto)
        .expect(201);

      testAssertions.expectQrCodeResponse(response.body);
      const payload = testAssertions.unwrapResponse(response.body);
      expect(payload.userId).toBe(userId);
      expect(payload.scans).toBe(0);
    });

    it('should reject invalid URL', async () => {
      const createQrDto = QrCodeFactory.create(userId, {
        targetUrl: 'invalid-url',
      });

      const response = await request(app.getHttpServer())
        .post('/api/qr-codes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createQrDto)
        .expect(422);

      testAssertions.expectErrorResponse(response.body);
    });
  });

  describe('GET /api/qr-codes', () => {
    it('should list user QR codes', async () => {
      const qrs = QrCodeFactory.createBatch(userId, 2);

      // Crear QRs
      for (const qr of qrs) {
        await request(app.getHttpServer())
          .post('/api/qr-codes')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(qr);
      }

      const response = await request(app.getHttpServer())
        .get('/api/qr-codes')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const payload = testAssertions.unwrapResponse(response.body);
      expect(Array.isArray(payload.data)).toBe(true);
      expect(payload.data.length).toBe(2);
    });
  });

  describe('GET /api/qr-codes/:id', () => {
    it('should get specific QR code', async () => {
      const createQrDto = QrCodeFactory.create(userId);

      const createResponse = await request(app.getHttpServer())
        .post('/api/qr-codes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createQrDto)
        .expect(201);

      const createdPayload = testAssertions.unwrapResponse(createResponse.body);
      const qrId = createdPayload.id;

      const response = await request(app.getHttpServer())
        .get(`/api/qr-codes/${qrId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      testAssertions.expectQrCodeResponse(response.body);
      const payload = testAssertions.unwrapResponse(response.body);
      expect(payload.id).toBe(qrId);
    });

    it('should return 404 for non-existent QR', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/qr-codes/999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      testAssertions.expectErrorResponse(response.body);
    });
  });

  describe('DELETE /api/qr-codes/:id', () => {
    it('should delete QR code', async () => {
      const createQrDto = QrCodeFactory.create(userId);

      const createResponse = await request(app.getHttpServer())
        .post('/api/qr-codes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createQrDto)
        .expect(201);

      const createdPayload = testAssertions.unwrapResponse(createResponse.body);
      const qrId = createdPayload.id;

      await request(app.getHttpServer())
        .delete(`/api/qr-codes/${qrId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // Verificar que fue eliminado
      await request(app.getHttpServer())
        .get(`/api/qr-codes/${qrId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
