import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import { GeoIpService } from './geoip.service';
import { ScanLogRepository } from './repositories/scan-log.repository';
import { QrStatisticRepository } from './repositories/qr-statistic.repository';
import { QrStatus } from '../../generated/prisma/enums';
import { UAParser } from 'ua-parser-js';

export interface RegisterScanInput {
  qrId: number;
  userId?: number | null;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class ScanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geoIpService: GeoIpService,
    private readonly scanLogRepository: ScanLogRepository,
    private readonly qrStatisticsRepository: QrStatisticRepository,
  ) {}

  async registerScan(input: RegisterScanInput): Promise<void> {
    const qr = await this.prisma.qrCode.findFirst({
      where: {
        id: input.qrId,
        status: QrStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (!qr) {
      throw new NotFoundException('QR code no encontrado o inactivo');
    }

    const geo = this.geoIpService.lookup(input.ipAddress);
    const device = this.parseDevice(input.userAgent);

    const day = this.toUtcDay(new Date());

    await this.prisma.$transaction(async (tx) => {
      await this.scanLogRepository.create(
        {
          qrId: input.qrId,
          userId: input.userId ?? undefined,
          ipAddress: input.ipAddress ?? undefined,
          userAgent: input.userAgent ?? undefined,
          country: geo.country ?? undefined,
          device,
        },
        tx,
      );

      await tx.qrCode.update({
        where: { id: input.qrId },
        data: {
          scans: { increment: 1 },
        },
      });

      await this.qrStatisticsRepository.incrementDaily(input.qrId, day, tx);
    });
  }

  private parseDevice(userAgent?: string | null): string | undefined {
    if (!userAgent) return undefined;

    const parsed = new UAParser(userAgent);
    const deviceType = parsed.getDevice().type;
    const browserName = parsed.getBrowser().name;
    const osName = parsed.getOS().name;

    if (!deviceType && !browserName && !osName) return 'unknown';

    return [deviceType ?? 'desktop', browserName, osName]
      .filter(Boolean)
      .join(' | ');
  }

  private toUtcDay(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }
}
