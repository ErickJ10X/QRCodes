import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/**
 * HealthModule
 * Proporciona endpoint de health check para:
 * - Verificar estado del servidor
 * - Verificar conectividad a PostgreSQL
 * - Verificar conectividad a Redis
 * - Retornar uptime y timestamp
 *
 * Endpoint público (sin autenticación requerida)
 * Útil para docker health checks, load balancers, monitoring
 */
@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
