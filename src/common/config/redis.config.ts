import { CacheModuleOptions } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { ConfigService } from '@nestjs/config';

/**
 * Configuración de Redis para @nestjs/cache-manager v3.x con @keyv/redis
 * @nestjs/cache-manager v3+ usa Keyv internamente, requiere adapters de @keyv/*
 *
 * Usa variables de entorno:
 * - REDIS_URL: URL completa (toma precedencia). Usar para providers con TLS, ej: rediss://... (Upstash)
 * - REDIS_HOST: Host del servidor Redis (default: localhost) — usado si REDIS_URL no está definida
 * - REDIS_PORT: Puerto del servidor Redis (default: 6379)
 * - REDIS_PASSWORD: Contraseña de Redis (opcional, default: redis123)
 * - CACHE_TTL: TTL por defecto en MILISEGUNDOS (default: 3600000 = 1 hora)
 *
 * @param configService - ConfigService de NestJS para leer .env
 * @returns CacheModuleOptions configuradas para Redis
 */
export const redisConfig = (configService: ConfigService): CacheModuleOptions => {
  const cacheTtl = configService.get<number>('CACHE_TTL', 3600000);

  // REDIS_URL toma precedencia — necesario para Upstash (rediss://) u otros providers con TLS
  const redisUrl =
    configService.get<string>('REDIS_URL') ??
    (() => {
      const host = configService.get<string>('REDIS_HOST', 'localhost');
      const port = configService.get<number>('REDIS_PORT', 6379);
      const password = configService.get<string>('REDIS_PASSWORD', 'redis123');
      return password
        ? `redis://:${password}@${host}:${port}`
        : `redis://${host}:${port}`;
    })();

  // @keyv/redis es el adapter correcto para @nestjs/cache-manager v3.x
  const store = new KeyvRedis(redisUrl);

  return {
    store,
    ttl: cacheTtl,
  };
};
