import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma.module';
import { GeoIpService } from './geoip.service';
import { ScanService } from './scan.service';
import { ScanLogRepository } from './repositories/scan-log.repository';
import { QrStatisticRepository } from './repositories/qr-statistic.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    GeoIpService,
    ScanService,
    ScanLogRepository,
    QrStatisticRepository,
  ],
  exports: [ScanService],
})
export class AnalythicsModule {}
