import { ApiProperty } from '@nestjs/swagger';

export class QrSummaryDto {
  @ApiProperty({ description: 'ID del QR', example: 1 })
  id: number;

  @ApiProperty({ description: 'Título del QR', example: 'Mi sitio web' })
  title: string;

  @ApiProperty({ description: 'Total de escaneos', example: 150 })
  totalScans: number;

  @ApiProperty({ description: 'Escaneos últimos 7 días', example: 42 })
  scansLastWeek: number;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;
}

export class DashboardDto {
  @ApiProperty({ description: 'Total de QRs activos del usuario', example: 5 })
  totalQrCodes: number;

  @ApiProperty({
    description: 'Total de escaneos de todos los QRs',
    example: 1250,
  })
  totalScans: number;

  @ApiProperty({ description: 'Escaneos últimos 7 días', example: 320 })
  scansLastWeek: number;

  @ApiProperty({ description: 'Escaneos últimos 30 días', example: 850 })
  scansLastMonth: number;

  @ApiProperty({
    description: 'Top 5 QRs más escaneados',
    type: [QrSummaryDto],
  })
  topQrCodes: QrSummaryDto[];

  @ApiProperty({
    description: 'Resumen por país (últimos 30 días)',
    example: [
      { country: 'US', scans: 450 },
      { country: 'MX', scans: 200 },
    ],
  })
  topCountries: Array<{ country: string; scans: number }>;
}
