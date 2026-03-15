import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/core/prisma.service';
import { DatabaseHelper } from '../helpers/database.helper';
import { UserFactory } from '../factories/user.factory';
import { QrCodeFactory } from '../factories/qr-code.factory';
import { setupTestApp, testAssertions } from '../helpers/test-assertions';

describe('Analytics Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let dbHelper: DatabaseHelper;
  let accessToken: string;
  let userId: number;
  let qrId: number;

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

    // Crear usuario
    const createUserDto = UserFactory.createRegisterDto();
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(createUserDto);

    const registerPayload = testAssertions.unwrapResponse(
      registerResponse.body,
    );
    accessToken = registerPayload.accessToken;
    userId = registerPayload.user.id;

    // Crear QR code
    const createQrDto = QrCodeFactory.create(userId);
    const qrResponse = await request(app.getHttpServer())
      .post('/api/qr-codes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createQrDto);

    const qrPayload = testAssertions.unwrapResponse(qrResponse.body);
    qrId = qrPayload.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/analytics/scan/:qrId', () => {
    it('should record a scan (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/analytics/scan/${qrId}`)
        .send({
          ipAddress: '192.168.1.1',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        })
        .expect(204);

      // Verificar que se registró en BD
      const scanLog = await prisma.scanLog.findFirst({
        where: { qrId },
      });

      expect(scanLog).toBeDefined();
      expect(scanLog?.ipAddress).toMatch(/127\.0\.0\.1$/);
    });
  });

  describe('GET /api/analytics/qr/:id', () => {
    it('should get QR statistics for owner', async () => {
      // Grabar algunos scans
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post(`/api/analytics/scan/${qrId}`)
          .send({
            ipAddress: '192.168.1.' + (i + 1),
            userAgent: 'Mozilla/5.0',
          });
      }

      const response = await request(app.getHttpServer())
        .get(`/api/analytics/qr/${qrId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const payload = testAssertions.unwrapResponse(response.body);
      expect(payload).toHaveProperty('totalScans');
      expect(payload).toHaveProperty('scansByDay');
      expect(payload).toHaveProperty('scansByCountry');
      expect(payload.totalScans).toBeGreaterThan(0);
    });

    it('should reject access from non-owner', async () => {
      // Crear otro usuario
      const otherUserDto = UserFactory.createRegisterDto();
      const otherUserResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(otherUserDto);

      const otherPayload = testAssertions.unwrapResponse(
        otherUserResponse.body,
      );
      const otherToken = otherPayload.accessToken;

      await request(app.getHttpServer())
        .get(`/api/analytics/qr/${qrId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('GET /api/analytics/dashboard', () => {
    it('should return user dashboard', async () => {
      // Grabar algunos scans
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post(`/api/analytics/scan/${qrId}`)
          .send({
            ipAddress: '192.168.1.' + (i + 1),
            userAgent: 'Mozilla/5.0',
          });
      }

      const response = await request(app.getHttpServer())
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const payload = testAssertions.unwrapResponse(response.body);
      expect(payload).toHaveProperty('totalQrCodes');
      expect(payload).toHaveProperty('totalScans');
      expect(payload).toHaveProperty('topQrCodes');
      expect(payload.totalScans).toBeGreaterThan(0);
    });
  });
});
