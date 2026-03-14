import { Injectable } from '@nestjs/common';
import { Prisma, ScanLog } from '../../../generated/prisma/client';
import { PrismaService } from '../../../core/prisma.service';

export interface CreateScanLogInput {
  qrId: number;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  device?: string;
}

@Injectable()
export class ScanLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateScanLogInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ScanLog> {
    const client = tx ?? this.prisma;
    return client.scanLog.create({
      data: {
        qrId: data.qrId,
        userId: data.userId ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        country: data.country ?? null,
        device: data.device ?? null,
      },
    });
  }
}
