import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma.module';
import { GeoIpService } from './geoip.service';
import { ScanService } from './scan.service';
import { ScanLogRepository } from './repositories/scan-log.repository';
import { QrStatisticRepository } from './repositories/qr-statistic.repository';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

/**
 * AnalytiscsModule
 * Responsable de registrar escaneos de Qrs y proporcionar estadísticas detalladas para cada QR
 */
@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    GeoIpService,
    ScanService,
    ScanLogRepository,
    QrStatisticRepository,
  ],
})
export class AnalyticsModule {}
