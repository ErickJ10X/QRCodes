import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QrStatus } from '../../../generated/prisma/enums';

/**
 * UpdateQrDto: Solo permite actualizar metadatos
 * NO permite cambiar: targetUrl, format, qrData (esos son inmutables)
 */
export class UpdateQrDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'Nuevo título', required: false })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Nueva descripción', required: false })
  description?: string;

  @IsOptional()
  @IsEnum(QrStatus)
  @ApiProperty({ enum: QrStatus, example: 'ARCHIVED', required: false })
  status?: QrStatus;
}
