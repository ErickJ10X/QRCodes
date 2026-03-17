import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';

/**
 * DTO de respuesta para health check
 * @description Estado del servidor y sus dependencias
 */
export class HealthResponseDto {
  @ApiProperty({
    description: 'Estado general del servidor',
    enum: ['ok', 'degraded', 'unhealthy'],
    example: 'ok',
  })
  status: 'ok' | 'degraded' | 'unhealthy';

  @ApiProperty({
    description: 'Estado de conexión a la base de datos',
    enum: ['connected', 'disconnected'],
    example: 'connected',
  })
  database: 'connected' | 'disconnected';

  @ApiProperty({
    description: 'Estado de conexión a Redis',
    enum: ['connected', 'disconnected'],
    example: 'connected',
  })
  redis: 'connected' | 'disconnected';

  @ApiProperty({
    description: 'Fecha y hora del health check',
    example: '2026-03-12T10:30:00.000Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Tiempo de actividad del servidor en segundos',
    example: 3600,
  })
  uptime: number;
}

/**
 * DTO de respuesta para health check de Redis
 */
export class RedisHealthResponseDto {
  @ApiProperty({
    description: 'Estado de conexión a Redis',
    enum: ['connected', 'disconnected'],
    example: 'connected',
  })
  redis: 'connected' | 'disconnected';

  @ApiProperty({
    description: 'Fecha y hora del health check',
    example: '2026-03-12T10:30:00.000Z',
  })
  timestamp: Date;
}

/**
 * DTO de respuesta para health check de Database
 */
export class DatabaseHealthResponseDto {
  @ApiProperty({
    description: 'Estado de conexión a la base de datos',
    enum: ['connected', 'disconnected'],
    example: 'connected',
  })
  database: 'connected' | 'disconnected';

  @ApiProperty({
    description: 'Fecha y hora del health check',
    example: '2026-03-12T10:30:00.000Z',
  })
  timestamp: Date;
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
    type: HealthResponseDto,
  })
  async check(): Promise<HealthResponseDto> {
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
    description: 'Estado de conexión a Redis',
    type: RedisHealthResponseDto,
  })
  async checkRedis(): Promise<RedisHealthResponseDto> {
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
    description: 'Estado de conexión a la base de datos',
    type: DatabaseHealthResponseDto,
  })
  async checkDatabase(): Promise<DatabaseHealthResponseDto> {
    const isHealthy = await this.healthService.checkDatabase();
    return {
      database: isHealthy ? 'connected' : 'disconnected',
      timestamp: new Date(),
    };
  }
}
