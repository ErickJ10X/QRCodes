import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma.service';
import { Prisma } from '../../../generated/prisma/client';

@Injectable()
export class QrStatisticRepository {
  constructor(private readonly prisma: PrismaService) {}

  async incrementDaily(
    qrId: number,
    date: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.qrStatistic.upsert({
      where: {
        qrId_date: {
          qrId,
          date,
        },
      },
      update: {
        scanCount: {
          increment: 1,
        },
      },
      create: {
        qrId,
        date,
        scanCount: 1,
      },
    });
  }
}
