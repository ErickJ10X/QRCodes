import { Module } from '@nestjs/common';
import { QrCodesController } from './qr-codes.controller';
import { QrCodesService } from './qr-codes.service';
import { QrCodesRepository } from './repositories/qr-codes.repository';
import { QrGeneratorService } from './qr-generator.service';

/**
 * QrCodesModule
 * Módulo encargado de la gestión de códigos QR
 * - DTOs: Validación de entrada/salida (create-qr.dto, update-qr.dto, etc.)
 * - Controller: Endpoints HTTP
 * - Service: Lógica de negocio
 * - Repository: Acceso a datos (Prisma)
 * - QrGeneratorService: Generación de códigos QR (sin inyección de dependencias)
 */
@Module({
  imports: [],
  controllers: [QrCodesController],
  providers: [QrCodesService, QrCodesRepository, QrGeneratorService],
  exports: [QrCodesService],
})
export class QrCodesModule {}
