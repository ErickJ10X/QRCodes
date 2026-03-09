import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisConfig } from '../../common/config/redis.config';
import { CacheService } from './cache.service';

/**
 * CacheModule
 * Módulo global que proporciona cache basado en Redis
 *
 * Configuración:
 * - Importa @nestjs/cache-manager v3.x y lo configura con cache-manager-redis-yet
 * - Proporciona CacheService como wrapper tipado
 * - Marcado como @Global() para inyectable en cualquier módulo sin import explícito
 * - TTL configurado en milisegundos (compatible con cache-manager v7+)
 *
 * Uso:
 * ```typescript
 * // 1. En AppModule (Fase 4):
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot(),
 *     CacheModule,  // ← Ya es @Global(), no necesita ser importado en otros módulos
 *   ],
 * })
 *
 * // 2. En un servicio (ej: QrCodesService):
 * constructor(private cache: CacheService) {}  // Inyectable globalmente
 * ```
 *
 * Dependencias de entorno (.env):
 * - REDIS_HOST (default: localhost)
 * - REDIS_PORT (default: 6379)
 * - REDIS_PASSWORD (default: redis123)
 * - CACHE_TTL (en MILISEGUNDOS, default: 3600000 = 1 hora)
 */
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        redisConfig(configService),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
