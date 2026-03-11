import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Prisma,
  QrCode,
  QrFormat,
  QrStatus,
} from '../../generated/prisma/client';
import { CreateQrDto } from './dto/create-qr.dto';
import { UpdateQrDto } from './dto/update-qr.dto';
import { QrResponseDto } from './dto/qr-response.dto';
import { QrListDto } from './dto/qr-list.dto';
import { QrCodesRepository } from './repositories/qr-codes.repository';
import { QrGeneratorService } from './qr-generator.service';
import { PrismaService } from '../../core/prisma.service';
import { CacheService } from '../cache/cache.service';
import { plainToInstance } from 'class-transformer';

/**
 * Opciones de paginación para listado de QR codes
 */
interface FindQrCodesOptions {
  page: number;
  limit: number;
  status?: QrStatus;
}

/**
 * QrCodesService
 * Lógica de negocio central para gestión de QR codes
 * Responsabilidades:
 * - Crear, listar, obtener, actualizar, eliminar QR codes
 * - Validar URLs y ownership
 * - Generar QRs mediante QrGeneratorService
 * - Acceder a datos mediante QrCodesRepository
 */
@Injectable()
export class QrCodesService {
  constructor(
    private qrRepository: QrCodesRepository,
    private qrGenerator: QrGeneratorService,
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  // cache configuration
  /**
   * TTL para cache de QR codes individuales
   * 7 dias: 604800 segundos
   * valor por defecto si QR_CACHE_TTL no esta definido
   */
  private readonly QR_CACHE_TTL = parseInt(
    process.env['QR_CACHE_TTL'] || '604800',
    10,
  );

  /**
   * Prefijo para cache keys de qr codes
   * Ej: 'qr:123' para QR con ID 123
   */
  private readonly CACHE_KEY_QR = 'qr';

  /**
   * Generar clave para cache de QR code
   * @param qrId - ID del QR code
   * @returns Clave para cache
   */
  private generateQrCacheKey(qrId: number): string {
    return `${this.CACHE_KEY_QR}:${qrId}`;
  }

  /**
   * Verificar que el QR pertenece al usuario
   * @throws NotFoundException si el QR no existe
   * @throws ForbiddenException si el usuario no es propietario
   */
  private async ensureOwnership(qrId: number, userId: number): Promise<QrCode> {
    const qr = await this.qrRepository.findById(qrId);
    if (!qr) {
      throw new NotFoundException('QR code no encontrado');
    }
    if (qr.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a este QR');
    }
    return qr;
  }

  /**
   * Validar que la URL es válida y segura (HTTP/HTTPS)
   * @throws BadRequestException si la URL es inválida
   */
  private validateUrl(url: string): void {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        throw new Error('Protocolo no soportado');
      }
    } catch (error) {
      throw new BadRequestException('URL inválida. Solo HTTP/HTTPS permitidos');
    }
  }

  /**
   * Mapear entidad QrCode a DTO de respuesta
   */
  private toResponseDto(qr: QrCode): QrResponseDto {
    return plainToInstance(QrResponseDto, qr, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Crear nuevo QR code
   * @param userId - ID del usuario propietario
   * @param createQrDto - Datos para crear el QR
   * @returns QrResponseDto del QR creado
   */
  async create(
    userId: number,
    createQrDto: CreateQrDto,
  ): Promise<QrResponseDto> {
    const {
      targetUrl,
      title,
      description,
      format,
      size,
      errorCorrection,
      tags,
    } = createQrDto;

    // Validar URL
    this.validateUrl(targetUrl);

    // Generar QR como Base64
    const qrData = await this.qrGenerator.generateAsBase64({
      data: targetUrl,
      format,
      size: size || 300,
      errorCorrection: errorCorrection || 'M',
    });

    try {
      // Crear QR en BD
      const qrRecord = await this.qrRepository.create({
        user: { connect: { id: userId } },
        targetUrl,
        title,
        description: description || '',
        format,
        qrData,
        status: QrStatus.ACTIVE,
      });

      // Crear metadata (tags) si existen
      if (tags && tags.length > 0) {
        await this.prisma.qrMetadata.createMany({
          data: tags.map((tag) => ({
            qrId: qrRecord.id,
            key: 'tag',
            value: tag,
          })),
        });
      }

      return this.toResponseDto(qrRecord);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`Error creando QR: ${message}`);
    }
  }

  /**
   * Listar QR codes del usuario con paginación
   * @param userId - ID del usuario
   * @param options - { page, limit, status? }
   * @returns QrListDto con datos paginados
   */
  async findAll(
    userId: number,
    options: FindQrCodesOptions,
  ): Promise<QrListDto> {
    const { data, total } = await this.qrRepository.findByUserId(
      userId,
      options,
    );

    return {
      data: data.map((qr) => this.toResponseDto(qr)),
      total,
      page: options.page,
      limit: options.limit,
      hasMore: options.page * options.limit < total,
    };
  }

  /**
   * Obtener QR específico
   * @param id - ID del QR
   * @param userId - ID del usuario (para validar ownership)
   * @returns QrResponseDto del QR obtenido
   */
  async findOne(id: number, userId: number): Promise<QrResponseDto> {
    const cacheKey = this.generateQrCacheKey(id);
    const cachedQr = await this.cacheService.get<QrCode>(cacheKey);
    if (cachedQr) {
      if (cachedQr.userId === userId) {
        return this.toResponseDto(cachedQr);
      }
    }
    const qr = await this.ensureOwnership(id, userId);
    await this.cacheService.set(cacheKey, qr, this.QR_CACHE_TTL * 1000);
    return this.toResponseDto(qr);
  }

  /**
   * Actualizar metadatos de QR
   * Solo permite cambiar: title, description, status
   * NO permite cambiar: targetUrl, format, qrData (esos son inmutables)
   * @param id - ID del QR
   * @param userId - ID del usuario
   * @param updateQrDto - Datos a actualizar
   * @returns QrResponseDto del QR actualizado
   */
  async update(
    id: number,
    userId: number,
    updateQrDto: UpdateQrDto,
  ): Promise<QrResponseDto> {
    // Verificar ownership
    await this.ensureOwnership(id, userId);

    // Preparar datos a actualizar
    const updateData: Prisma.QrCodeUpdateInput = {};

    if (updateQrDto.title !== undefined) {
      updateData.title = updateQrDto.title;
    }
    if (updateQrDto.description !== undefined) {
      updateData.description = updateQrDto.description;
    }
    if (updateQrDto.status !== undefined) {
      updateData.status = updateQrDto.status;
    }

    // Actualizar en BD
    const updatedQr = await this.qrRepository.update(id, updateData);

    const cacheKey = this.generateQrCacheKey(id);
    await this.cacheService.del(cacheKey);

    return this.toResponseDto(updatedQr);
  }

  /**
   * Soft delete un QR code (cambiar status a DELETED)
   * @param id - ID del QR
   * @param userId - ID del usuario
   */
  async remove(id: number, userId: number): Promise<void> {
    await this.ensureOwnership(id, userId);
    await this.qrRepository.softDelete(id);
    const cacheKey = this.generateQrCacheKey(id);
    await this.cacheService.del(cacheKey);
  }

  /**
   * Archivar un QR code (cambiar status a ARCHIVED)
   * @param id - ID del QR
   * @param userId - ID del usuario
   * @returns QrResponseDto del QR archivado
   */
  async archive(id: number, userId: number): Promise<QrResponseDto> {
    await this.ensureOwnership(id, userId);
    const archivedQr = await this.qrRepository.softArchive(id);
    const cacheKey = this.generateQrCacheKey(id);
    await this.cacheService.del(cacheKey);
    return this.toResponseDto(archivedQr);
  }

  /**
   * Descargar QR como archivo (PNG o SVG)
   * Decodifica el Base64 guardado en BD
   * @param id - ID del QR
   * @param userId - ID del usuario
   * @returns Objecto con buffer y formato del QR para descargar
   */
  async downloadQr(
    id: number,
    userId: number,
  ): Promise<{ buffer: Buffer; format: QrFormat }> {
    const qr = await this.ensureOwnership(id, userId);

    try {
      // Decodificar Base64 guardado en BD
      const buffer = Buffer.from(qr.qrData, 'base64');
      return { buffer, format: qr.format };
    } catch (error) {
      throw new BadRequestException('Error decodificando QR para descarga');
    }
  }

  /**
   * Obtener estadísticas de un QR específico
   * Retorna información básica. Fase 5 (AnalyticsModule) ampliará con más detalles
   * @param id - ID del QR
   * @param userId - ID del usuario
   * @returns Objeto con estadísticas básicas del QR
   */
  async getStats(
    id: number,
    userId: number,
  ): Promise<{
    id: number;
    totalScans: number;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const qr = await this.ensureOwnership(id, userId);

    return {
      id: qr.id,
      totalScans: qr.scans,
      createdAt: qr.createdAt,
      updatedAt: qr.updatedAt,
    };
  }
}
