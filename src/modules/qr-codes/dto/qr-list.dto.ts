import { ApiProperty } from '@nestjs/swagger';
import { QrResponseDto } from './qr-response.dto';

export class QrListDto {
  @ApiProperty({ type: [QrResponseDto] })
  data: QrResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: true })
  hasMore: boolean;
}