import { faker } from '@faker-js/faker/.';
import { QrFormat } from 'src/generated/prisma/enums';
import { CreateQrDto } from 'src/modules/qr-codes/dto/create-qr.dto';
import { QrResponseDto } from 'src/modules/qr-codes/dto/qr-response.dto';

export class QrCodeFactory {
  static create(userId: number, overrides?: Partial<CreateQrDto>): CreateQrDto {
    return {
      targetUrl: faker.internet.url(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      format: QrFormat.PNG,
      tags: [faker.commerce.department(), faker.commerce.department()],
      ...overrides,
    };
  }

  static createBatch(userId: number, count: number): CreateQrDto[] {
    return Array.from({ length: count }, () => this.create(userId));
  }

  static toResponseDto(qrCode: any): QrResponseDto {
    return {
      id: qrCode.id,
      userId: qrCode.userId,
      targetUrl: qrCode.targetUrl,
      title: qrCode.name,
      description: qrCode.description,
      format: qrCode.format,
      qrData: qrCode.qrData,
      status: qrCode.status,
      scans: qrCode.scans,
      createdAt: qrCode.createdAt,
      updatedAt: qrCode.updatedAt,
    };
  }
}
