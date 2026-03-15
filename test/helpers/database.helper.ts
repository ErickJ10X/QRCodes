import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../src/core/prisma.service';

export class DatabaseHelper {
  constructor(private prisma: PrismaService) {}

  async clearDatabase() {
    await this.prisma.scanLog.deleteMany({});
    await this.prisma.qrStatistic.deleteMany({});
    await this.prisma.qrMetadata.deleteMany({});
    await this.prisma.qrCode.deleteMany({});
    await this.prisma.refreshToken.deleteMany({});
    await this.prisma.user.deleteMany({});
  }

  async seedUsers(users: any[]) {
    const created = [];
    for (const user of users) {
      const createdUser = await this.prisma.user.create({
        data: {
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role || 'USER',
        },
      });
      created.push(createdUser);
    }
    return created;
  }

  async seedQrCodes(userId: number, qrCodes: any[]) {
    const created = [];
    for (const qr of qrCodes) {
      const createdQr = await this.prisma.qrCode.create({
        data: {
          userId,
          targetUrl: qr.targetUrl,
          title: qr.name,
          description: qr.description,
          qrData: qr.qrData,
          format: qr.format || 'PNG',
          status: qr.status || 'ACTIVE',
        },
      });
      created.push(createdQr);
    }
    return created;
  }

  async resetAutoIncrement(table: string) {
    const tableName = table.toLowerCase() + 's';
    try {
      await this.prisma.$executeRawUnsafe(
        `ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1`,
      );
    } catch {
      // Ignore errors, e.g., if the table doesn't exist
    }
  }
}
