import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { QrStatus } from '../../../generated/prisma/enums';

export class ListQrQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Numero de pagina',
    example: 1,
    default: 1,
    minimum: 1,
  })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({
    description: 'Cantidad por pagina',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  limit?: number = 10;

  @IsOptional()
  @IsEnum(QrStatus)
  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: QrStatus,
  })
  status?: QrStatus;
}
