import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO para registrar un escaneo de QR
 * se envia desde el frontend cuando un usuario escanea un QR
 */
export class RecordScanDto {
  @ApiProperty({
    description: 'ID del Qr escaneado',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  qrId?: number;

  @ApiProperty({
    description: 'Id del usuario escaneado',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({
    description: 'IP del cliente que escanea',
    example: '192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent del cliente que escanea',
    example:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
