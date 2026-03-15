import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ScanService } from './scan.service';
import { AnalyticsService } from './analytics.service';
import { RecordScanDto } from './dto/record-scan.dto';
import { QrStatDto } from './dto/qr-stat.dto';
import { DashboardDto } from './dto/dashboard.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../generated/prisma/client';
import { PrismaService } from '../../core/prisma.service';

/**
 * AnalyticsController
 * Endpoints para registrar escaneos y obtener estadísticas
 */
@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly scanService: ScanService,
    private readonly analyticsService: AnalyticsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /analytics/scan/:qrId
   * Registra un escaneo de QR
   * publico: puede ser llamado desde cualquier lugar
   */
  @Post('scan/:qrId')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Registra escaneo de QR',
    description:
      'Registra un escaneo de QR con información del dispositivo y ubicación',
  })
  @ApiResponse({ status: 204, description: 'Escaneo registrado exitosamente' })
  @ApiResponse({ status: 404, description: 'QR no encontrado' })
  async recordScan(
    @Param('qrId', ParseIntPipe) qrId: number,
    @Body() dto: RecordScanDto,
    @Req() req: Request,
  ): Promise<void> {
    const ipAddress = this.getClientIp(req);
    const userAgent = req.get('User-Agent');

    await this.scanService.registerScan({
      qrId,
      userId: dto.userId ?? null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    });
  }

  /**
   * GET /analytics/qr/:qrId
   * Obtiene estadísticas detalladas de un QR específico
   * privado: solo el dueño del QR puede acceder
   */
  @Get('qr/:qrId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Estadisticas del QR',
    description: 'Obtiene estadísticas detalladas de un QR específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Stats del QR',
    type: QrStatDto,
  })
  @ApiResponse({ status: 404, description: 'QR code no encontrado' })
  async getQrStats(
    @Param('qrId', ParseIntPipe) qrId: number,
    @CurrentUser() user: User,
  ): Promise<QrStatDto> {
    const qr = await this.getQrAndValidateOwnership(qrId, user.id);

    return this.analyticsService.getQrStats(qr.id);
  }

  /**
   * GET /analytics/dashboard
   * Dashboard del usuario con resumen de todos sus QRs
   * Requiere JWT
   */
  @Get('dashboard')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Dashboard del usuario',
    description:
      'Obtiene dashboard con resumen: total QRs, total escaneos, top QRs, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard del usuario',
    type: DashboardDto,
  })
  async getDashboard(@CurrentUser() user: User): Promise<DashboardDto> {
    return this.analyticsService.getUserDashboard(user.id);
  }

  /**
   * Metodo auxiliar para validar ownership
   */
  private async getQrAndValidateOwnership(
    qrId: number,
    userId: number,
  ): Promise<{ id: number }> {
    const qr = await this.prisma.qrCode.findUnique({
      where: { id: qrId },
      select: { userId: true, id: true },
    });

    if (!qr) {
      throw new NotFoundException('QR no encontrado');
    }

    if (qr.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a estas estadísticas',
      );
    }

    return { id: qr.id };
  }

  /**
   * Obtener IP del cliente
   */
  private getClientIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() ?? null;
    }
    return (req.socket.remoteAddress as string) ?? null;
  }
}
