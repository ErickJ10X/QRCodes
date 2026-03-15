import { faker } from '@faker-js/faker';
import { RecordScanDto } from 'src/modules/analytics/dto/record-scan.dto';

export class ScanLogFactory {
  static create(overrides?: Partial<RecordScanDto>): RecordScanDto {
    return {
      qrId: faker.number.int({ min: 1, max: 100 }),
      userId:
        Math.random() < 0.5 ? faker.number.int({ min: 1, max: 10 }) : undefined,
      ipAddress: faker.internet.ipv4(),
      userAgent: faker.internet.userAgent(),
      ...overrides,
    };
  }

  static createBatch(count: number): RecordScanDto[] {
    return Array.from({ length: count }, () => this.create());
  }

  static createFromQrId(qrId: number, count: number): RecordScanDto[] {
    return Array.from({ length: count }, () => this.create({ qrId }));
  }
}
