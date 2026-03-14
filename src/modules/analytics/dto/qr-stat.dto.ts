import { ApiProperty } from '@nestjs/swagger';

export class DailyScanDto {
  @ApiProperty({ description: 'Fecha del día', example: '2026-03-14' })
  date: string;

  @ApiProperty({ description: 'Cantidad de escaneos en ese día', example: 42 })
  count: number;
}

export class CountryScanDto {
  @ApiProperty({ description: 'Código país ISO', example: 'US' })
  country: string;

  @ApiProperty({
    description: 'Cantidad de escaneos desde ese país',
    example: 15,
  })
  count: number;
}

export class QrStatDto {
  @ApiProperty({ description: 'ID del QR', example: 1 })
  id: number;

  @ApiProperty({ description: 'Total de escaneos históricos', example: 250 })
  totalScans: number;

  @ApiProperty({ description: 'Escaneos últimos 30 días (por día)' })
  scansByDay: DailyScanDto[];

  @ApiProperty({ description: 'Escaneos por país (últimos 30 días)' })
  scansByCountry: CountryScanDto[];

  @ApiProperty({ description: 'Fecha del último escaneo' })
  lastScanned?: Date;
}
