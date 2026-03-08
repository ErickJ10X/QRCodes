import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Body,
  Query,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { QrFormat, QrStatus, User } from '../../generated/prisma/client';
import { QrCodesService } from './qr-codes.service';
import { CreateQrDto } from './dto/create-qr.dto';
import { UpdateQrDto } from './dto/update-qr.dto';
import { QrResponseDto } from './dto/qr-response.dto';
import { QrListDto } from './dto/qr-list.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * QrCodesController
 * Endpoints HTTP para gestión de códigos QR
 * Todos los endpoints están protegidos por GlobalAuthGuard (JWT)
 */
@ApiTags('qr-codes')
@ApiBearerAuth()
@Controller('qr-codes')
export class QrCodesController {
  constructor(private qrCodesService: QrCodesService) {}

  /**
   * Crear nuevo código QR
   * POST /qr-codes
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo código QR' })
  async create(
    @Body() createQrDto: CreateQrDto,
    @CurrentUser() user: User,
  ): Promise<QrResponseDto> {
    return this.qrCodesService.create(user.id, createQrDto);
  }

  /**
   * Listar códigos QR del usuario (paginado)
   * GET /qr-codes?page=1&limit=10&status=ACTIVE
   */
  @Get()
  @ApiOperation({ summary: 'Listar códigos QR del usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: QrStatus })
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: QrStatus,
  ): Promise<QrListDto> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.qrCodesService.findAll(user.id, {
      page: pageNumber,
      limit: limitNumber,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un código QR por su ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<QrResponseDto> {
    return this.qrCodesService.findOne(id, user.id);
  }

  /**
   * Actualizar un código QR
   * PUT /qr-codes/:id
   * Solo permite cambios en: title, description, status
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un código QR' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQrDto: UpdateQrDto,
    @CurrentUser() user: User,
  ): Promise<QrResponseDto> {
    return this.qrCodesService.update(id, user.id, updateQrDto);
  }

  /**
   * Eliminar un código QR (soft delete)
   * DELETE /qr-codes/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un código QR' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.qrCodesService.remove(id, user.id);
  }

  /**
   * Archivar un código QR
   * POST /qr-codes/:id/archive
   */
  @Post(':id/archive')
  @ApiOperation({ summary: 'Archivar un código QR' })
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<QrResponseDto> {
    return this.qrCodesService.archive(id, user.id);
  }

  /**
   * Descargar código QR como imagen
   * GET /qr-codes/:id/download
   */
  @Get(':id/download')
  @ApiOperation({ summary: 'Descargar el código QR como imagen' })
  async download(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, format } = await this.qrCodesService.downloadQr(
      id,
      user.id,
    );
    const extension = format === QrFormat.PNG ? 'png' : 'svg';
    const contentType = format === QrFormat.PNG ? 'image/png' : 'image/svg+xml';

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="qr-code-${id}.${extension}"`,
    );
    res.send(buffer);
  }

  /**
   * Obtener estadísticas de un código QR
   * GET /qr-codes/:id/stats
   */
  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de un código QR' })
  async getStats(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<{
    id: number;
    totalScans: number;
    createdAt: Date;
    updatedAt: Date;
  }> {
    return this.qrCodesService.getStats(id, user.id);
  }
}
