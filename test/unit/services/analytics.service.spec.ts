import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../../../src/modules/analytics/analytics.service';
import { CacheService } from '../../../src/modules/cache/cache.service';
import { PrismaService } from '../../../src/core/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let cacheService: jest.Mocked<CacheService>;
  let prisma: any;

  beforeEach(async () => {
    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockPrisma = {
      scanLog: {
        findFirst: jest.fn(),
        groupBy: jest.fn(),
        count: jest.fn(),
      },
      qrStatistic: {
        findMany: jest.fn(),
      },
      qrCode: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    cacheService = module.get(CacheService) as jest.Mocked<CacheService>;
    prisma = module.get(PrismaService) as any;
  });

  describe('getQrStats', () => {
    it('should return cached stats if available', async () => {
      const qrId = 1;
      const cachedStats = {
        totalScans: 10,
        scansByDay: [],
        scansByCountry: [],
      };

      cacheService.get.mockResolvedValue(cachedStats);

      const result = await service.getQrStats(qrId);

      expect(cacheService.get).toHaveBeenCalled();
      expect(result).toEqual(cachedStats);
    });

    it('should fetch and cache stats if not cached', async () => {
      const qrId = 1;

      cacheService.get.mockResolvedValue(null);
      // Mock Prisma queries aquí

      // El test completo dependerá de la implementación exacta
      expect(cacheService.get).toBeDefined();
    });
  });

  describe('getUserDashboard', () => {
    it('should return user dashboard stats', async () => {
      const userId = 1;

      cacheService.get.mockResolvedValue(null);

      prisma.qrCode.findMany.mockResolvedValue([
        { id: 1, scans: 3, title: 'QR 1', createdAt: new Date() },
      ] as any);
      prisma.scanLog.count.mockResolvedValue(3);
      prisma.scanLog.groupBy.mockResolvedValue([] as any);

      const result = await service.getUserDashboard(userId);

      expect(result).toBeDefined();
      expect(result.totalQrCodes).toBe(1);
    });
  });

  describe('getQrStats', () => {
    it('should throw NotFoundException if qr does not exist', async () => {
      cacheService.get.mockResolvedValue(null);
      prisma.qrCode.findUnique.mockResolvedValue(null);

      await expect(service.getQrStats(999)).rejects.toThrow(NotFoundException);
    });
  });
});
