import { BadRequestException, Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { QrFormat } from 'src/generated/prisma/enums';

/**
 * Opciones para generación de QR codes
 */
export interface QrGenerationOptions {
  data: string; // URL o contenido a codificar
  format: QrFormat; // PNG o SVG
  size?: number; // Ancho/alto en píxeles (default 300, rango 100-2000)
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'; // Nivel de corrección (default 'M')
  color?: { dark: string; light: string }; // Colores hex opcionales
}

/**
 * QrGeneratorService
 * Genera QR codes en formato PNG o SVG
 * SRP: Solo genera QR, no guarda en BD ni valida URLs
 */
@Injectable()
export class QrGeneratorService {
  private readonly DEFAULT_SIZE = 300;
  private readonly DEFAULT_ERROR_CORRECTION = 'M';
  private readonly DEFAULT_COLOR = { dark: '#000000', light: '#FFFFFF' };

  /**
   * Generar QR como Base64 string
   * Útil para almacenar en BD (qrData)
   * @returns Promise<string> - QR codificado en Base64
   */
  async generateAsBase64(options: QrGenerationOptions): Promise<string> {
    const {
      data,
      format,
      size = this.DEFAULT_SIZE,
      errorCorrection = this.DEFAULT_ERROR_CORRECTION,
      color = this.DEFAULT_COLOR,
    } = options;

    try {
      if (format === QrFormat.PNG) {
        const buffer = await QRCode.toBuffer(data, {
          width: size,
          errorCorrectionLevel: errorCorrection,
          color,
        });
        return buffer.toString('base64');
      }

      if (format === QrFormat.SVG) {
        const svg = await QRCode.toString(data, {
          type: 'svg',
          width: size,
          errorCorrectionLevel: errorCorrection,
          color,
        });
        return Buffer.from(svg).toString('base64');
      }

      throw new BadRequestException('Formato no soportado');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`Error generando QR: ${message}`);
    }
  }

  /**
   * Generar QR como Buffer
   * Útil para descargar archivo directamente (GET /qr-codes/:id/download)
   * @returns Promise<Buffer> - QR como buffer binario
   */
  async generateAsBuffer(options: QrGenerationOptions): Promise<Buffer> {
    const {
      data,
      format,
      size = this.DEFAULT_SIZE,
      errorCorrection = this.DEFAULT_ERROR_CORRECTION,
      color = this.DEFAULT_COLOR,
    } = options;

    try {
      if (format === QrFormat.PNG) {
        return await QRCode.toBuffer(data, {
          width: size,
          errorCorrectionLevel: errorCorrection,
          color,
        });
      }

      if (format === QrFormat.SVG) {
        const svg = await QRCode.toString(data, {
          type: 'svg',
          width: size,
          errorCorrectionLevel: errorCorrection,
          color,
        });
        return Buffer.from(svg);
      }

      throw new BadRequestException('Formato no soportado');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`Error generando QR: ${message}`);
    }
  }
}
