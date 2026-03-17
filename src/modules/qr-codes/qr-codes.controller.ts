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
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { QrFormat, QrStatus, User } from '../../generated/prisma/client';
import { QrCodesService } from './qr-codes.service';
import { CreateQrDto } from './dto/create-qr.dto';
import { UpdateQrDto } from './dto/update-qr.dto';
import { QrResponseDto } from './dto/qr-response.dto';
import { QrListDto } from './dto/qr-list.dto';
import { ListQrQueryDto } from './dto/list-qr-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * QrCodesController
 * Endpoints HTTP para gestión de códigos QR
 * Todos los endpoints están protegidos por GlobalAuthGuard (JWT)
 */
@ApiTags('QR-Codes')
@ApiBearerAuth('JWT-auth')
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
  @ApiResponse({
    status: 201,
    description: 'Código QR creado exitosamente',
    type: QrResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
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
  @ApiResponse({
    status: 200,
    description: 'Lista de códigos QR',
    type: QrListDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: ListQrQueryDto,
  ): Promise<QrListDto> {
    return this.qrCodesService.findAll(user.id, {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      status: query.status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un código QR por su ID' })
  @ApiParam({ name: 'id', description: 'ID del código QR', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Código QR encontrado',
    type: QrResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para ver este QR',
  })
  @ApiResponse({ status: 404, description: 'Código QR no encontrado' })
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
  @ApiOperation({
    summary: 'Actualizar un código QR',
    description: 'Solo permite cambiar title, description y status',
  })
  @ApiParam({ name: 'id', description: 'ID del código QR', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Código QR actualizado',
    type: QrResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para modificar este QR',
  })
  @ApiResponse({ status: 404, description: 'Código QR no encontrado' })
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
  @ApiOperation({
    summary: 'Eliminar un código QR',
    description: 'Realiza un soft delete (marca como DELETED)',
  })
  @ApiParam({ name: 'id', description: 'ID del código QR', type: Number })
  @ApiResponse({ status: 204, description: 'Código QR eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para eliminar este QR',
  })
  @ApiResponse({ status: 404, description: 'Código QR no encontrado' })
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
  @ApiOperation({
    summary: 'Archivar un código QR',
    description: 'Cambia el estado a ARCHIVED',
  })
  @ApiParam({ name: 'id', description: 'ID del código QR', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Código QR archivado',
    type: QrResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para archivar este QR',
  })
  @ApiResponse({ status: 404, description: 'Código QR no encontrado' })
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
  @ApiOperation({
    summary: 'Descargar el código QR como imagen',
    description: 'Retorna el archivo PNG o SVG',
  })
  @ApiParam({ name: 'id', description: 'ID del código QR', type: Number })
  @ApiResponse({ status: 200, description: 'Archivo de imagen del QR' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para descargar este QR',
  })
  @ApiResponse({ status: 404, description: 'Código QR no encontrado' })
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
  @ApiParam({ name: 'id', description: 'ID del código QR', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del código QR',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        totalScans: { type: 'number', example: 150 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permiso para ver estas estadísticas',
  })
  @ApiResponse({ status: 404, description: 'Código QR no encontrado' })
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
