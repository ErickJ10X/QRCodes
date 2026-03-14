import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reader, ReaderModel } from '@maxmind/geoip2-node';

export interface GeoIpResult {
  country?: string;
  city?: string;
}

@Injectable()
export class GeoIpService implements OnModuleInit {
  private readonly logger = new Logger(GeoIpService.name);
  private reader: ReaderModel | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const dbPath = this.configService.get<string>(
      'GEOIP_DB_PATH',
      './data/GeoLite2-City.nmdb',
    );

    try {
      this.reader = await Reader.open(dbPath);
      this.logger.log(`GeoIP base de datos cargada desde: ${dbPath}`);
    } catch (error) {
      this.logger.warn(
        `No se pudo cargar la base de datos GeoIP desde ${dbPath}: ${error.message}`,
      );
      this.reader = null;
    }
  }

  lookup(ip?: string | null): GeoIpResult {
    const normalizedIp = this.normalizeIp(ip);
    if (!normalizedIp || !this.reader) {
      return {};
    }

    try {
      const result = this.reader.city(normalizedIp);
      return {
        country: result.country?.isoCode ?? undefined,
        city: result.city?.names?.en ?? undefined,
      };
    } catch {
      return {};
    }
  }

  private normalizeIp(ip?: string | null): string | null {
    if (!ip) return null;

    const first = ip.split(',')[0]?.trim();
    if (!first) return null;

    if (first === '::1') return '127.0.0.1';

    if (first.startsWith('::ffff:')) {
      return first.replace('::ffff:', '');
    }

    return first;
  }
}
