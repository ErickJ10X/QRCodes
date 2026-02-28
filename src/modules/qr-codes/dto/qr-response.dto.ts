import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QrFormat, QrStatus } from '../../../generated/prisma/enums';

export class QrResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 1 })
  userId: number;

  @Expose()
  @ApiProperty({ example: 'https://example.com' })
  targetUrl: string;

  @Expose()
  @ApiProperty({ example: 'Mi código QR' })
  title: string;

  @Expose()
  @ApiProperty({ example: 'Descripción del QR', required: false })
  description?: string;

  @Expose()
  @ApiProperty({ enum: QrFormat, example: 'PNG' })
  format: QrFormat;

  @Expose()
  @ApiProperty({ example: 'data:image/png;base64,iVBORw0KGgoAAAANS...' })
  qrData: string; // Base64 encoded

  @Expose()
  @ApiProperty({ enum: QrStatus, example: 'ACTIVE' })
  status: QrStatus;

  @Expose()
  @ApiProperty({ example: 5 })
  scans: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
