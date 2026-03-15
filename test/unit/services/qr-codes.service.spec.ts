import { Test, TestingModule } from '@nestjs/testing';
import { QrCodesService } from '../../../src/modules/qr-codes/qr-codes.service';
import { QrCodesRepository } from '../../../src/modules/qr-codes/repositories/qr-codes.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { QrCodeFactory } from '../../factories/qr-code.factory';
import { QrGeneratorService } from '../../../src/modules/qr-codes/qr-generator.service';
import { PrismaService } from '../../../src/core/prisma.service';
import { CacheService } from '../../../src/modules/cache/cache.service';

describe('QrCodesService', () => {
  let service: QrCodesService;
  let repository: jest.Mocked<QrCodesRepository>;
  let cacheService: jest.Mocked<CacheService>;
  let qrGenerator: jest.Mocked<QrGeneratorService>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      softArchive: jest.fn(),
    };

    const mockQrGenerator = {
      generateAsBase64: jest.fn().mockResolvedValue('base64-qr'),
    };

    const mockPrisma = {
      qrMetadata: {
        createMany: jest.fn(),
      },
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrCodesService,
        { provide: QrCodesRepository, useValue: mockRepository },
        { provide: QrGeneratorService, useValue: mockQrGenerator },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<QrCodesService>(QrCodesService);
    repository = module.get(
      QrCodesRepository,
    ) as jest.Mocked<QrCodesRepository>;
    qrGenerator = module.get(
      QrGeneratorService,
    ) as jest.Mocked<QrGeneratorService>;
    cacheService = module.get(CacheService) as jest.Mocked<CacheService>;
  });

  describe('create', () => {
    it('should create a new QR code', async () => {
      const userId = 1;
      const createQrDto = QrCodeFactory.create(userId);
      const expectedQr = {
        id: 1,
        userId,
        ...createQrDto,
        qrData: 'base64-qr',
        status: 'ACTIVE',
        scans: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create.mockResolvedValue(expectedQr as any);

      const result = await service.create(userId, createQrDto);

      expect(qrGenerator.generateAsBase64).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalled();
      expect(result.userId).toBe(userId);
    });
  });

  describe('findOne', () => {
    it('should return a QR code by id', async () => {
      const qrId = 1;
      const userId = 1;
      const mockQr = {
        id: qrId,
        userId,
        targetUrl: 'https://example.com',
        name: 'Test QR',
        scans: 5,
      };

      repository.findById.mockResolvedValue(mockQr as any);
      cacheService.get.mockResolvedValue(null);

      const result = await service.findOne(qrId, userId);

      expect(repository.findById).toHaveBeenCalledWith(qrId);
      expect(result.id).toBe(qrId);
    });

    it('should throw NotFoundException if QR not found', async () => {
      repository.findById.mockResolvedValue(null);
      cacheService.get.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete QR owned by user', async () => {
      const qrId = 1;
      const userId = 1;
      const mockQr = { id: qrId, userId };

      repository.findById.mockResolvedValue(mockQr as any);
      repository.softDelete.mockResolvedValue(mockQr as any);

      await service.remove(qrId, userId);

      expect(repository.softDelete).toHaveBeenCalledWith(qrId);
      expect(cacheService.del).toHaveBeenCalledWith('qr:1');
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const qrId = 1;
      const userId = 1;
      const ownerId = 2;
      const mockQr = { id: qrId, userId: ownerId };

      repository.findById.mockResolvedValue(mockQr as any);

      await expect(service.remove(qrId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
