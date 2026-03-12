import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'unhealthy';
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
  timestamp: Date;
  uptime: number;
}

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private healthService: HealthService) {}
  /**
   * Endpoint de health check
   * Verifica estado de todas las dependencias
   * Público (sin autenticación)
   *
   * Respuestas:
   * - 200 OK: Servidor y todas dependencias funcionan
   * - 200 Degraded: Servidor activo pero al menos una dependencia falla
   * - 200 Unhealthy: Múltiples dependencias fallan
   *
   * Uso:
   * - Docker health checks
   * - Load balancer checks
   * - Monitoring/alerting systems
   * - Kubernetes liveness/readiness probes
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Health check del servidor',
    description: 'Verifica estado del servidor y dependencias',
  })
  @ApiResponse({
    status: 200,
    description: 'Servidor activo y funcionando',
    example: {
      success: true,
      message: 'Success',
      data: {
        status: 'ok',
        database: 'connected',
        redis: 'connected',
        timestamp: '2026-02-23T10:30:00.000Z',
        uptime: 3600,
      },
    },
  })
  async check(): Promise<HealthResponse> {
    return this.healthService.performHealthCheck();
  }

  /**
   * Endpoint específico para verificar solo Redis
   * Útil para debugging y monitoring granular
   */
  @Get('redis')
  @Public()
  @ApiOperation({
    summary: 'Health check de Redis',
    description: 'Verifica conectividad a Redis únicamente',
  })
  @ApiResponse({
    status: 200,
    example: {
      success: true,
      message: 'Success',
      data: {
        redis: 'connected',
        timestamp: '2026-03-11T10:30:00.000Z',
      },
    },
  })
  async checkRedis(): Promise<{
    redis: 'connected' | 'disconnected';
    timestamp: Date;
  }> {
    const isHealthy = await this.healthService.checkRedis();
    return {
      redis: isHealthy ? 'connected' : 'disconnected',
      timestamp: new Date(),
    };
  }

  /**
   * Endpoint específico para verificar solo Database
   * Útil para debugging y monitoring granular
   */
  @Get('database')
  @Public()
  @ApiOperation({
    summary: 'Health check de Base de Datos',
    description: 'Verifica conectividad a PostgreSQL únicamente',
  })
  @ApiResponse({
    status: 200,
    example: {
      success: true,
      message: 'Success',
      data: {
        database: 'connected',
        timestamp: '2026-03-11T10:30:00.000Z',
      },
    },
  })
  async checkDatabase(): Promise<{
    database: 'connected' | 'disconnected';
    timestamp: Date;
  }> {
    const isHealthy = await this.healthService.checkDatabase();
    return {
      database: isHealthy ? 'connected' : 'disconnected',
      timestamp: new Date(),
    };
  }
}
