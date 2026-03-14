import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import { CacheService } from '../cache/cache.service';
import { QrStatDto, DailyScanDto, CountryScanDto } from './dto/qr-stat.dto';
import { DashboardDto, QrSummaryDto } from './dto/dashboard.dto';

@Injectable()
export class AnalyticsService {
  private readonly CACHE_TTL = 300000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Obtener estadisticas detalladas de un QR especifico
   * @param qrId ID del QR
   * @returns Estadisticas con desagregacion por dia, pais
   */
  async getQrStats(qrId: number): Promise<QrStatDto> {
    const cacheKey = `analytics:qr:${qrId}`;
    const cached = await this.cacheService.get<QrStatDto>(cacheKey);

    if (cached) return cached;

    const qr = await this.prisma.qrCode.findUnique({
      where: { id: qrId },
      select: { scans: true },
    });

    if (!qr) {
      throw new NotFoundException('QR no encontrado');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const scansByday = await this.prisma.qrStatistic.findMany({
      where: {
        qrId,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'desc' },
      select: {
        date: true,
        scanCount: true,
      },
    });

    const scansByCountry = await this.prisma.scanLog.groupBy({
      by: ['country'],
      where: {
        qrId,
        scannedAt: { gte: thirtyDaysAgo },
      },
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    const lastScan = await this.prisma.scanLog.findFirst({
      where: { qrId },
      orderBy: { scannedAt: 'desc' },
      select: { scannedAt: true },
    });

    const result: QrStatDto = {
      id: qrId,
      totalScans: qr.scans,
      scansByDay: scansByday.map((s) => ({
        date: s.date.toISOString().split('T')[0],
        count: s.scanCount,
      })),
      scansByCountry: scansByCountry
        .filter((s) => s.country)
        .map((s) => ({
          country: s.country!,
          count: s._count,
        })),
      lastScanned: lastScan?.scannedAt,
    };

    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  /**
   * Obtener dashboard del usuario con resumen de todos sus QRs
   * @Param userId - ID del usuario
   * @returns Resumen de QRs con total de escaneos y actividad reciente
   */
  async getUserDashboard(userId: number): Promise<DashboardDto> {
    const cacheKey = `analytics:dashboard:${userId}`;
    const cached = await this.cacheService.get<DashboardDto>(cacheKey);

    if (cached) return cached;

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);

    const qrCodes = await this.prisma.qrCode.findMany({
      where: { userId },
      select: {
        id: true,
        scans: true,
        title: true,
        createdAt: true,
      },
      orderBy: { scans: 'desc' },
    });

    const totalQrCodes = qrCodes.length;
    const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scans, 0);

    const scansLastWeek = await this.prisma.scanLog.count({
      where: {
        qrCode: { userId },
        scannedAt: { gte: lastWeek },
      },
    });

    const scansLastMonth = await this.prisma.scanLog.count({
      where: {
        qrCode: { userId },
        scannedAt: { gte: lastMonth },
      },
    });

    const topCountries = await this.prisma.scanLog.groupBy({
      by: ['country'],
      where: {
        qrCode: { userId },
        scannedAt: { gte: lastMonth },
      },
      _count: true,
      orderBy: { _count: { country: 'desc' } },
      take: 5,
    });

    const topQrCodes: QrSummaryDto[] = qrCodes.slice(0, 5).map((qr) => {
      const scansLastWeekForQr = qrCodes.reduce((sum, q) => {
        if (q.id === qr.id) {
          return sum;
        }
        return sum;
      }, 0);

      return {
        id: qr.id,
        title: qr.title,
        totalScans: qr.scans,
        scansLastWeek: scansLastWeekForQr,
        createdAt: qr.createdAt,
      };
    });

    const result: DashboardDto = {
      totalQrCodes,
      totalScans,
      scansLastWeek,
      scansLastMonth,
      topQrCodes,
      topCountries: topCountries
        .filter((c) => c.country)
        .map((c) => ({
          country: c.country!,
          scans: c._count,
        })),
    };
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }
}
