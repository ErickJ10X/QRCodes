import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { Prisma, QrCode } from '../../../generated/prisma/client';
import { QrStatus } from '../../../generated/prisma/enums';

/**
 * Opciones de paginación para queries de QrCode
 */
interface FindQrCodesOptions {
  page: number;
  limit: number;
  status?: QrStatus;
}

/**
 * QrCodesRepository
 * Encapsula todas las operaciones Prisma para QrCode
 * Solo habla con Prisma, sin lógica de negocio
 */
@Injectable()
export class QrCodesRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo QR code
   */
  async create(data: Prisma.QrCodeCreateInput): Promise<QrCode> {
    return this.prisma.qrCode.create({
      data,
      include: { metadata: true },
    });
  }

  /**
   * Obtener un QR code por ID
   */
  async findById(id: number): Promise<QrCode | null> {
    return this.prisma.qrCode.findUnique({
      where: { id },
      include: { metadata: true },
    });
  }

  /**
   * Obtener todos los QR codes de un usuario (paginado)
   * @param userId - ID del usuario propietario
   * @param options - { page, limit, status? }
   * @returns { data: QrCode[], total: number }
   */
  async findByUserId(
    userId: number,
    options: FindQrCodesOptions,
  ): Promise<{ data: QrCode[]; total: number }> {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.QrCodeWhereInput = { userId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.qrCode.findMany({
        where,
        include: { metadata: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.qrCode.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Actualizar campos de un QR code
   */
  async update(id: number, data: Prisma.QrCodeUpdateInput): Promise<QrCode> {
    return this.prisma.qrCode.update({
      where: { id },
      data,
      include: { metadata: true },
    });
  }

  /**
   * Soft delete: cambiar status a DELETED
   */
  async softDelete(id: number): Promise<QrCode> {
    return this.prisma.qrCode.update({
      where: { id },
      data: { status: QrStatus.DELETED },
      include: { metadata: true },
    });
  }

  /**
   * Archivar: cambiar status a ARCHIVED
   */
  async softArchive(id: number): Promise<QrCode> {
    return this.prisma.qrCode.update({
      where: { id },
      data: { status: QrStatus.ARCHIVED },
      include: { metadata: true },
    });
  }

  /**
   * Incrementar contador de escaneos
   */
  async incrementScans(id: number): Promise<QrCode> {
    return this.prisma.qrCode.update({
      where: { id },
      data: { scans: { increment: 1 } },
      include: { metadata: true },
    });
  }

  /**
   * Obtener total de QR codes de un usuario
   */
  async count(userId: number, status?: QrStatus): Promise<number> {
    const where: Prisma.QrCodeWhereInput = { userId };
    if (status) where.status = status;
    return this.prisma.qrCode.count({ where });
  }
}
