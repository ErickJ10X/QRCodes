import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QrFormat } from '../../../generated/prisma/enums';

export class CreateQrDto {
  @IsUrl()
  @ApiProperty({ example: 'https://example.com' })
  targetUrl: string;
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'Mi código QR' })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Descripción del QR', required: false })
  description?: string;

  @IsEnum(QrFormat)
  @ApiProperty({ enum: QrFormat, example: 'PNG' })
  format: QrFormat;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(2000)
  @ApiProperty({ example: 300, required: false })
  size?: number;

  @IsOptional()
  @IsIn(['L', 'M', 'Q', 'H'])
  @ApiProperty({ example: 'M', required: false })
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ example: ['tag1', 'tag2'], required: false })
  tags?: string[];
}
