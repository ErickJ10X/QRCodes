import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigService } from '@nestjs/config';

/**
 * Configuración de Redis para @nestjs/cache-manager v3.x + cache-manager v7 + cache-manager-redis-yet v5.x
 * Proporciona opciones de conexión y TTL por defecto usando cache-manager-redis-yet
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
export const redisConfig = (
  configService: ConfigService,
): CacheModuleOptions => {
  const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
  const redisPort = configService.get<number>('REDIS_PORT', 6379);
  const redisPassword = configService.get<string>('REDIS_PASSWORD', 'redis123');
  // TTL en MILISEGUNDOS (3600000 = 1 hora)
  const cacheTtl = configService.get<number>('CACHE_TTL', 3600000);

  return {
    // v3.x usa "stores" (array) en lugar de "store" (string)
    stores: [
      redisStore({
        socket: {
          host: redisHost,
          port: redisPort,
        },
        password: redisPassword,
        // Nota: db no es soportado en cache-manager-redis-yet v5.x
        // Si necesitas múltiples bases de datos, crea instancias separadas
      }),
    ],
    ttl: cacheTtl, // En milisegundos para cache-manager v7
  } as CacheModuleOptions;
};
