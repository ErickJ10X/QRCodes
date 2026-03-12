import { CacheModuleOptions } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { ConfigService } from '@nestjs/config';

/**
 * Configuración de Redis para @nestjs/cache-manager v3.x con @keyv/redis
 * @nestjs/cache-manager v3+ usa Keyv internamente, requiere adapters de @keyv/*
 *
 * Usa variables de entorno:
 * - REDIS_HOST: Host del servidor Redis (default: localhost)
 * - REDIS_PORT: Puerto del servidor Redis (default: 6379)
 * - REDIS_PASSWORD: Contraseña de Redis (opcional, default: redis123)
 * - CACHE_TTL: TTL por defecto en MILISEGUNDOS (default: 3600000 = 1 hora)
 *
 * @param configService - ConfigService de NestJS para leer .env
 * @returns CacheModuleOptions configuradas para Redis
 */
export const redisConfig = (configService: ConfigService): CacheModuleOptions => {
  const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
  const redisPort = configService.get<number>('REDIS_PORT', 6379);
  const redisPassword = configService.get<string>('REDIS_PASSWORD', 'redis123');
  const cacheTtl = configService.get<number>('CACHE_TTL', 3600000);

  // Construir URL de Redis con autenticación
  const redisUrl = redisPassword
    ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
    : `redis://${redisHost}:${redisPort}`;

  // @keyv/redis es el adapter correcto para @nestjs/cache-manager v3.x
  const store = new KeyvRedis(redisUrl);

  return {
    store,
    ttl: cacheTtl,
  };
};
